const express = require('express');
const router = express.Router();
const { insertData, deleteData, updateData, runQuery } = require('../lib/db');
const multer = require('multer');
const os = require('os');
const parseCSV = require('../utils/parser');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
        // Use the original filename to preserve file extension
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

async function batch_job(rows) {
    await runQuery("BEGIN TRANSACTION");    
    try {
        for (const row of rows) {
            const batch_job_name = row[0];
            switch (batch_job_name) {
                case "INSERTED":
                    await insertData(row.slice(1)); // Remove the header.
                    break;
                case "UPDATED":
                    await updateData(row.slice(1));
                    break;
                case "DELETED":
                    await deleteData(row.slice(1));
                    break;
                default:
                    console.error("Invalid batch job name");
            }
        }
        console.log("All modifications from the delta file have been successfully implemented.")
        await runQuery("COMMIT");  
    } catch (err) {
        console.error("Error occurred while processing batch job: ", err);
        await runQuery("ROLLBACK");
    }
}

// Error handling for multer
const handleUploadError = (err, req, res, next) => {
    const errorMessage = err.message + ". Please make sure that the key value of the file being sent is 'file'."
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: errorMessage });
    }
    if (err) {
        return res.status(400).json({ error: errorMessage });
    }
    next();
};

/**
 * @swagger
 * tags:
 *   name: Batch Job
 *   description: API to process delta files
 * /batch_job:
 *   post:
 *     tags: [Batch Job]
 *     summary: Process delta files
 *     description: Process delta files and perform batch operations on the database.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Delta file processed. Batch job completed successfully.
 *       400:
 *         description: No file uploaded or Invalid file type
 *       500:
 *         description: Server error
 */

router.post("/", upload.single('file'), handleUploadError, async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send("No file uploaded");
        return;
    }

    const { mimetype, path } = file; // Getting the content-type and path of the file
    switch (mimetype) {
        case "text/csv":
            const rows = await parseCSV(path);
            await batch_job(rows);
            res.status(200).send("Delta file processed. Batch job completed successfully.");
            break;
        // Extendable to other file types
        default:
            res.status(400).send("Invalid file type");
            break;
    }
});

module.exports = router;