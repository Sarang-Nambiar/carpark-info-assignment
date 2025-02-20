CREATE TABLE User (
    UserID INT PRIMARY KEY,
    Name VARCHAR(100)
)

CREATE TABLE CarPark (

)

CREATE TABLE Favorite (
    CarParkID INT,
    UserID INT,
    PRIMARY KEY (CarParkID, UserID)
)