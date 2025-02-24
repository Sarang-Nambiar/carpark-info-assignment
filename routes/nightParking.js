const express = require('express');
const router = express.Router();
const { getAllQuery } = require('../lib/db');

const LIMIT = 100; // Limit on the number of rows returned

/**
 * @swagger
 * tags:
 *   name: Night Parking
 *   description: API to fetch all records with night parking
 * /filter/night_parking:
 *   get:
 *     tags: [Night Parking]
 *     summary: Retrieve night parking locations
 *     description: Returns a list of 100 car parks(max) with night parking for a certain page.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: The page number for pagination.
 *     responses:
 *       200:
 *         description: A list of car parks with night parking.
 *       500:
 *         description: Server error.
 */

router.get("/", async (req, res) => {
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

module.exports = router;