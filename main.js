const express = require('express');
const app = express();  
const cors = require('cors');
const { getAllQuery, getQuery, runQuery } = require('./lib/db');
const parseCSV = require('./utils/parser');
const multer = require('multer');
const os = require('os');
const batch_job = require('./batch-job');
const PORT = 8000;
const LIMIT = 100; // Limit on the number of rows returned

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

app.use(cors());

app.get("/filter/free_parking", async (req, res) => {
    const page = parseInt(req.query.page) || 0;  // Get page number
    try {
        const offset = (page - 1) * LIMIT;
        
        let data = await getAllQuery(`
            SELECT car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, day as free_parking_day, start_time as free_parking_start_time, end_time as free_parking_end_time, short_term_parking, night_parking, car_park_decks, gantry_height, car_park_basement  FROM CarPark cp 
            JOIN (SELECT * FROM CarPark_FreeParking WHERE day != 'N.A.' AND start_time != 'N.A.' AND end_time != 'N.A.') cfp ON cp.free_parkingID = cfp.free_parkingID
            JOIN CarPark_Location cpl ON cp.locationID = cpl.locationID
            JOIN CarPark_Type cpt ON cp.typeID = cpt.typeID
            JOIN CarPark_Policy cpp ON cp.policyID = cpp.policyID 
            LIMIT ${LIMIT} OFFSET ${offset}`);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error occurred while fetching data: ", err); 
        res.status(500).send(`Error occurred while fetching data: ${err}`);
    }

});

app.get("/filter/night_parking", async (req, res) => {
    const page = parseInt(req.query.page) || 0;  // Get page number
    try {
        const offset = (page - 1) * LIMIT;

        let data = await getAllQuery(`
            SELECT car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, day as free_parking_day, start_time as free_parking_start_time, end_time as free_parking_end_time, short_term_parking, night_parking, car_park_decks, gantry_height, car_park_basement FROM CarPark cp 
            JOIN CarPark_FreeParking cfp ON cp.free_parkingID = cfp.free_parkingID
            JOIN CarPark_Location cpl ON cp.locationID = cpl.locationID
            JOIN CarPark_Type cpt ON cp.typeID = cpt.typeID
            JOIN (SELECT * FROM CarPark_Policy WHERE night_parking='YES') cpp ON cp.policyID = cpp.policyID 
            LIMIT ${LIMIT} OFFSET ${offset}`);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error occurred while fetching data: ", err); 
        res.status(500).send(`Error occurred while fetching data: ${err}`);
    }
});

app.get("/filter/height_limit", async (req, res) => {
    const page = parseInt(req.query.page) || 0;  // Get page number
    const { height } = req.query;
    
    if (!height) {
        res.status(400).send("Missing required parameters");
        return;
    }
    const offset = (page - 1) * LIMIT;
    try {
        let data = await getAllQuery(`
        SELECT car_park_no, address, x_coord, y_coord, car_park_type, type_of_parking_system, day as free_parking_day, start_time as free_parking_start_time, end_time as free_parking_end_time, short_term_parking, night_parking, car_park_decks, gantry_height, car_park_basement FROM CarPark cp 
        JOIN CarPark_FreeParking cfp ON cp.free_parkingID = cfp.free_parkingID
        JOIN CarPark_Location cpl ON cp.locationID = cpl.locationID
        JOIN CarPark_Type cpt ON cp.typeID = cpt.typeID
        JOIN CarPark_Policy cpp ON cp.policyID = cpp.policyID
        WHERE cp.gantry_height <= ${height} 
        LIMIT ${LIMIT} OFFSET ${offset}`);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error occurred while fetching data: ", err);
        res.status(500).send(`Error occurred while fetching data: ${err}`);
    }
    
});

// Expects a delta file in the format provided in the README
app.post("/batch_job", upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send("No file uploaded");
        return;
    }

    const { mimetype, path } = file; // Getting the content-type and path of the file
    switch (mimetype) {
        case "text/csv":
            console.log(path);
            const rows = parseCSV(path);
            console.log(rows);
            await batch_job(rows);
            res.status(200).send("Delta file processed. Batch job completed successfully.");
            break;
        // Add more cases for different file types
        default:
            res.status(400).send("Invalid file type");
            break;
    }
});

// Request query should contain the car park number and the user ID of the user who favorited the car park
app.post("/add/favorite", async (req, res) => {  
    const { carparkno, userID } = req.query;

    if (!carparkno || !userID) {
        res.status(400).send("Missing required parameters");
        return;
    }

    const userExists = await getQuery(`SELECT * FROM User WHERE UserID = ${userID} LIMIT 1`);
    if (!userExists) {
        res.status(400).send("User does not exist");
        return;
    }

    const carParkExists = await getQuery(`SELECT * FROM CarPark WHERE car_park_no = '${carparkno}' LIMIT 1`);
    if (!carParkExists) {
        res.status(400).send("Car park does not exist");
        return;
    }

    const recordExists = await getQuery(`SELECT * FROM Favorite WHERE CarParkID = ? AND UserID = ?`,
        [carparkno, userID]
    );
    
    if(recordExists) {
        res.status(400).send("The favorite already exists in the table.")
        return;
    }

    try {
        await runQuery(`INSERT INTO Favorite VALUES ('${carparkno}', ${userID})`);
        res.status(200).send("Successfully added to favorites");
    } catch (err) {
        console.error("Error occurred while inserting into Favorites table: ", err)
        res.status(500).send(`Error occurred while inserting into Favorites table: ${err}`);
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});