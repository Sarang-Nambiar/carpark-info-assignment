# Car-Park-Info
This is a backend designed to provide information about car parks in Singapore based on whether the following criteria are met:
- Free parking is available
- Night parking is available
- Car park meets the user's vehicle height requirement.
- Add a user's favourite car park

The backend is also able to run a batch job which accepts a CSV delta file interfaced from the source and makes any necessary changes to the database. The format of how the CSV file should look like is given in the data/test-delta.csv file. Essentially, the format doesn't differ much from the original data file, but an extra column is added at the start of the file to indicate the operation to be performed on the data. The operation can be either 'UPDATED' for update, 'DELETED' for delete, or 'INSERTED' for insert.

The database is an in-memory SQLite database that is created and populated with the original hdb-carpark-information-20220824010400.csv data file. 

The following is the ER diagram of the database schema:
give ER diagram here

The original CarPark table is decomposed into the following tables to ensure that the database is in 3NF:
- CarPark: Contains the main car park information
- CarPark_Type: Contains the car park type information
- CarPark_Location: Contains the car park location information
- CarPark_Policy: Contains the car park policy information
- CarPark_FreeParking: Contains the car park free parking information

## Things to note before running:
- Make sure to have SQLite installed on your machine. Moreover, configure the database to enable foreign key constraints. This can be done by running the following command in the SQLite shell:
```sql
PRAGMA foreign_keys = ON;
```
- If you haven't done so already, install the required packages by running the following command in the root directory:
```bash
npm install
```
- The PORT information is stored inside a .env file. Make sure to create a .env file in the root directory and add the following line:
```bash
PORT=8000
```

## How to run
To run the backend, run the following command in the root directory:
```bash
npm start
```

The backend will be running on http://localhost:8000
The Swagger documentation can be accessed at http://localhost:8000/api-docs

## How to run the batch job
To run the batch job, follow the steps below:
1. Create a CSV file in the format specified in the data/test-delta.csv file.
2. Start the backend server by running the following command in the root directory:
```bash
npm start
```
3. Send a POST request to the /batch_job endpoint with the CSV file attached as a form-data. The key should be 'file'.
4. The batch job will run and make the necessary changes to the database.