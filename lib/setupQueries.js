// Constants for creating tables in the database
const create_tables = `
CREATE TABLE User (
    UserID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

CREATE TABLE CarPark (
    car_park_no TEXT PRIMARY KEY,
    locationID INTEGER DEFAULT NULL,
    typeID INTEGER DEFAULT NULL, 
    policyID INTEGER DEFAULT NULL,
    free_parkingID INTEGER DEFAULT NULL,
    car_park_decks INTEGER DEFAULT NULL,
    gantry_height REAL DEFAULT NULL,
    FOREIGN KEY (locationID) REFERENCES CarPark_Location(locationID),
    FOREIGN KEY (typeID) REFERENCES CarPark_Type(typeID),
    FOREIGN KEY (policyID) REFERENCES CarPark_Policy(policyID),
    FOREIGN KEY (free_parkingID) REFERENCES CarPark_FreeParking(free_parkingID)
);

CREATE TABLE CarPark_Type (
    typeID INTEGER PRIMARY KEY AUTOINCREMENT,
    car_park_type TEXT DEFAULT NULL,
    type_of_parking_system TEXT DEFAULT NULL,
    car_park_basement TEXT DEFAULT NULL
);

CREATE TABLE CarPark_Location (
    locationID INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT DEFAULT NULL,
    x_coord REAL DEFAULT NULL,
    y_coord REAL DEFAULT NULL
);

CREATE TABLE CarPark_Policy (
    policyID INTEGER PRIMARY KEY AUTOINCREMENT,
    short_term_parking TEXT DEFAULT NULL,
    night_parking TEXT DEFAULT NULL
);

CREATE TABLE CarPark_FreeParking (
    free_parkingID INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT DEFAULT NULL,
    start_time TEXT DEFAULT NULL,
    end_time TEXT DEFAULT NULL
);

CREATE TABLE Favorite (
    CarParkID INTEGER,
    UserID INTEGER,
    PRIMARY KEY (CarParkID, UserID),
    FOREIGN KEY (CarParkID) REFERENCES CarPark(car_park_no),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);
`;

module.exports = {
  create_tables,
};
