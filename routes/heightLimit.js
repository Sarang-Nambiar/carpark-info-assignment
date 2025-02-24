const express = require('express');
const router = express.Router();
const { getAllQuery } = require('../lib/db');

const LIMIT = 100; // Limit on the number of rows returned

/**
 * @swagger
 * tags:
 *   name: Height Limit
 *   description: API to fetch all records over a certain height limit
 * /filter/height_limit:
 *   get:
 *     tags: [Height Limit]
 *     summary: Retrieve car park locations over a certain height limit
 *     description: Returns a list of maximum 100 car parks that meet user's vehicle height requirements for a certain page.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: The page number for pagination.
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *           description: The height of the vehicle.
 *     responses:
 *      200:
 *          description: A list of car parks with night parking.
 *      400:    
 *          description: Missing required parameters.
 *      500:
 *          description: Server error.
 */
router.get("/", async (req, res) => {
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
        WHERE cp.gantry_height >= ${height} 
        LIMIT ${LIMIT} OFFSET ${offset}`);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error occurred while fetching data: ", err);
        res.status(500).send(`Error occurred while fetching data: ${err}`);
    }
});

module.exports = router;