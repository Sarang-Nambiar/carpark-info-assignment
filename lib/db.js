const sqlite3 = require("sqlite3");
const { create_tables } = require("./setup-queries");
const parseCSV = require("../utils/parser");

const db = new sqlite3.Database(":memory:", async (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to SQLite3 database");

  setupDatabase();
  data = await parseCSV("./data/hdb-carpark-information-20220824010400.csv"); // replace this with the file parser of your choice

  await runQuery(`INSERT INTO User VALUES (1, 'Test User')`); // Inserting test user for adding favorite
  await runQuery("BEGIN TRANSACTION");
  try {
    for (const row of data) {
      await insertData(row);
    }
    console.log("Data inserted successfully");
    await runQuery("COMMIT");
  } catch (err) {
    console.error("Error inserting data:", err);
    await runQuery("ROLLBACK");
  }
});

function freeParkingParser(freeparking) {
  const freeParkingArray = [];
  try {
    if (!freeparking || freeparking === "NO") {
      // If the freeparking string contains "NO"
      return ["N.A.", "N.A.", "N.A."];
    }
    // If the freeparking string contains the day and time
    const temp1 = freeparking.split("FR");
    const day = temp1[0].replaceAll(" ", "");
    freeParkingArray.push(day);

    const temp2 = temp1[1].split("-");
    const start_time = temp2[0].replaceAll(" ", "");
    const end_time = temp2[1].replaceAll(" ", "");
    freeParkingArray.push(start_time);
    freeParkingArray.push(end_time);

    return freeParkingArray;
  } catch (err) {
    console.log(err);
    return ["N.A.", "N.A.", "N.A."];
  }
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, function (err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAllQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, function (err, rows) {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function setupDatabase() {
  db.exec(create_tables, (err) => {
    if (err) {
      console.error("Error creating tables:", err.message);
    } else {
      console.log("Created the required tables");
    }
  });
}

async function insertData(row) {
  let [
    car_park_no,
    address,
    x_coord,
    y_coord,
    car_park_type,
    type_of_parking_system,
    short_term_parking,
    free_parking,
    night_parking,
    car_park_decks,
    gantry_height,
    car_park_basement,
  ] = row;

  x_coord = x_coord ? parseFloat(x_coord) : null;
  y_coord = y_coord ? parseFloat(y_coord) : null;
  car_park_decks = car_park_decks ? parseInt(car_park_decks) : null;
  gantry_height = gantry_height ? parseFloat(gantry_height) : null;

  // For location table
  let locationID;
  const locResult = await getQuery(
    "SELECT locationID FROM CarPark_Location WHERE address = ?",
    [address]
  );
  if (locResult) {
    locationID = locResult.locationID;
  } else {
    const locResult = await runQuery(
      "INSERT INTO CarPark_Location (address, x_coord, y_coord) VALUES (?, ?, ?)",
      [address, x_coord, y_coord]
    );
    locationID = locResult.lastID;
  }

  // For type table
  let typeID;
  const typeResult = await getQuery(
    "SELECT typeID FROM CarPark_Type WHERE car_park_type = ? AND type_of_parking_system = ? AND car_park_basement = ?",
    [car_park_type, type_of_parking_system, car_park_basement]
  );

  if (typeResult) {
    typeID = typeResult.typeID;
  } else {
    // Insert into type table if the value set is not found
    const typeResult = await runQuery(
      "INSERT INTO CarPark_Type (car_park_type, type_of_parking_system, car_park_basement) VALUES (?, ?, ?)",
      [car_park_type, type_of_parking_system, car_park_basement]
    );
    typeID = typeResult.lastID;
  }

  // For policy table
  let policyID;
  const policyResult = await getQuery(
    "SELECT policyID FROM CarPark_Policy WHERE short_term_parking = ? AND night_parking = ?",
    [short_term_parking, night_parking]
  );
  if (policyResult) {
    policyID = policyResult.policyID;
  } else {
    // Insert into policy table if the value set is not found
    const policyResult = await runQuery(
      "INSERT INTO CarPark_Policy (short_term_parking, night_parking) VALUES (?, ?)",
      [short_term_parking, night_parking]
    );
    policyID = policyResult.lastID;
  }
  // For free parking table
  let freeparkingID;
  const freeParkingArray = freeParkingParser(free_parking);
  const [day, start_time, end_time] = freeParkingArray;
  const freeParkingResult = await getQuery(
    "SELECT free_parkingID FROM CarPark_FreeParking WHERE day = ? AND start_time = ? AND end_time = ?",
    [day, start_time, end_time]
  );

  if (freeParkingResult) {
    freeparkingID = freeParkingResult.free_parkingID;
  } else {
    const freeParkingResult = await runQuery(
      "INSERT INTO CarPark_FreeParking (day, start_time, end_time) VALUES (?, ?, ?)",
      [day, start_time, end_time]
    );
    freeparkingID = freeParkingResult.lastID;
  }

  // For the main car park table
  await runQuery(
    "INSERT INTO CarPark (car_park_no, locationID, typeID, policyID, free_parkingID, car_park_decks, gantry_height) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      car_park_no,
      locationID,
      typeID,
      policyID,
      freeparkingID,
      car_park_decks,
      gantry_height,
    ]
  );
}

async function updateData(row) {
  // Update the data in the database
  let [
    car_park_no,
    address,
    x_coord,
    y_coord,
    car_park_type,
    type_of_parking_system,
    short_term_parking,
    free_parking,
    night_parking,
    car_park_decks,
    gantry_height,
    car_park_basement,
  ] = row;

  x_coord = x_coord ? parseFloat(x_coord) : null;
  y_coord = y_coord ? parseFloat(y_coord) : null;
  car_park_decks = car_park_decks ? parseInt(car_park_decks) : null;
  gantry_height = gantry_height ? parseFloat(gantry_height) : null;

  // For location table
  let locationID;
  const locResult = await getQuery(
    "SELECT locationID FROM CarPark_Location WHERE address = ?",
    [address]
  );

  if (locResult) {
    locationID = locResult.locationID;
    await runQuery(
      `UPDATE CarPark_Location SET address = ?, x_coord = ?, y_coord = ? WHERE locationID = ?`,
      [address, x_coord, y_coord, locationID]
    );
  } else {
    // Current implementation would throw an error if the locationID isn't found
    // but you can handle it differently
    throw new Error("Location not found");
  }

  let policyID;
  const policyResult = await getQuery(
    "SELECT policyID FROM CarPark_Policy WHERE short_term_parking = ? AND night_parking = ?",
    [short_term_parking, night_parking]
  );

  if (policyResult) {
    policyID = policyResult.policyID;
    await runQuery(
      `UPDATE CarPark_Policy SET short_term_parking = ?, night_parking = ? WHERE policyID = ?`,
      [short_term_parking, night_parking, policyID]
    );
  } else {
    throw new Error("Policy not found");
  }

  let freeparkingID;
  const freeParkingArray = freeParkingParser(free_parking);
  const [day, start_time, end_time] = freeParkingArray;
  const freeParkingResult = await getQuery(
    "SELECT free_parkingID FROM CarPark_FreeParking WHERE day = ? AND start_time = ? AND end_time = ?",
    [day, start_time, end_time]
  );

  if (freeParkingResult) {
    freeparkingID = freeParkingResult.free_parkingID;
    await runQuery(
      `UPDATE CarPark_FreeParking SET day = ?, start_time = ?, end_time = ? WHERE free_parkingID = ?`,
      [day, start_time, end_time, freeparkingID]
    );
  } else {
    throw new Error("Free parking not found");
  }

  let typeID;
  const typeResult = await getQuery(
    "SELECT typeID FROM CarPark_Type WHERE car_park_type = ? AND type_of_parking_system = ? AND car_park_basement = ?",
    [car_park_type, type_of_parking_system, car_park_basement]
  );

  if (typeResult) {
    typeID = typeResult.typeID;
    await runQuery(
      "UPDATE CarPark_Type SET car_park_type = ?, type_of_parking_system = ?, car_park_basement = ? WHERE typeID = ?",
      [car_park_type, type_of_parking_system, car_park_basement, typeID]
    );
  } else {
    throw new Error("Type not found");
  }

  // Main car park table
  const carparkResult = await getQuery(
    `SELECT * FROM CarPark WHERE car_park_no = ?`,
    [car_park_no]
  );
  if (!carparkResult) {
    throw new Error("Car Park Number not found.");
  }

  await runQuery(
    "UPDATE CarPark SET locationID = ?, typeID = ?, policyID = ?, free_parkingID = ?, car_park_decks = ?, gantry_height = ? WHERE car_park_no = ?",
    [
      locationID,
      typeID,
      policyID,
      freeparkingID,
      car_park_decks,
      gantry_height,
      car_park_no,
    ]
  );
}

// Only deleting entries from the main table
// Leaving the entries from the lookup tables as it is to avoid KeyNotFound errors
async function deleteData(row) {
  // Delete the data in the database
  const car_park_no = row[0];

  // Main car park table
  const carparkResult = await getQuery(
    `SELECT * FROM CarPark WHERE car_park_no = ?`,
    [car_park_no]
  );
  if (!carparkResult) {
    throw new Error("Car Park Number not found.");
  }
  await runQuery("DELETE FROM CarPark WHERE car_park_no = ?", [car_park_no]);
}

module.exports = {
  db,
  runQuery,
  getQuery,
  getAllQuery,
  insertData,
  updateData,
  deleteData,
};
