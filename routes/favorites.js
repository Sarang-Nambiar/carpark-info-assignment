const express = require('express');
const router = express.Router();
const { getQuery, runQuery } = require('../lib/db');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API to add a car park to favorites
 * /add/favorite:
 *   post:
 *     tags: [Favorites]
 *     summary: Add a car park to favorites
 *     description: Add a car park to favorites for a user
 *     parameters:
 *       - in: query
 *         name: carparkno
 *         schema:
 *           type: string
 *           description: The car park number
 *       - in: query
 *         name: userID
 *         schema:
 *           type: integer
 *           description: The user ID
 *     responses:
 *       200:
 *         description: Successfully added to favorites
 *       400:
 *         description: Missing required parameters or User does not exist or Car park does not exist or The favorite already exists in the table.
 *       500:
 *         description: Error occurred while inserting into Favorites table
 */

router.post("/", async (req, res) => {  
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

module.exports = router;    
