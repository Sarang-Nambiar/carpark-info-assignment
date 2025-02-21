CREATE TABLE User (
    UserID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

CREATE TABLE CarPark (
    car_park_no INTEGER PRIMARY KEY,
    locationID INTEGER DEFAULT NULL,
    typeID INTEGER DEFAULT NULL, 
    policyID INTEGER DEFAULT NULL,
    free_parking TEXT CHECK (free_parking IN ('YES', 'NO')) DEFAULT NULL,
    car_park_decks INTEGER DEFAULT NULL,
    gantry_height REAL DEFAULT NULL,
    FOREIGN KEY (locationID) REFERENCES CarPark_Location(locationID),
    FOREIGN KEY (typeID) REFERENCES CarPark_Type(typeID),
    FOREIGN KEY (policyID) REFERENCES CarPark_Policy(policyID)
);

CREATE TABLE CarPark_Type (
    typeID INTEGER PRIMARY KEY AUTOINCREMENT,
    car_park_type TEXT DEFAULT NULL,
    type_of_parking_system TEXT DEFAULT NULL,
    car_park_basement TEXT CHECK (car_park_basement IN ('Y', 'N')) DEFAULT NULL
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
    night_parking INTEGER CHECK (night_parking IN (0, 1)) DEFAULT NULL
);

CREATE TABLE Favorite (
    CarParkID INTEGER,
    UserID INTEGER,
    PRIMARY KEY (CarParkID, UserID),
    FOREIGN KEY (CarParkID) REFERENCES CarPark(car_park_no),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);
