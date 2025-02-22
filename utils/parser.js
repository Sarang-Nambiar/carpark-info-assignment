const { parse } = require('csv-parse');
const fs = require('fs');

// This function will parse the CSV file and return the rows
const parseCSV = (path) => {
    return new Promise((resolve, reject) => {
        const rows = []; // Contains the row data from the input file
        fs.createReadStream(path)
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                rows.push(row);
            })
            .on("end", function () {
                console.log("CSV file has been successfully processed");
                resolve(rows);
            })
            .on("error", function (err) {
                console.error("Something went wrong: ", err.message);
                reject(err);
            });
    });
}

// Could potentially extend this functionality over to other file types

module.exports = parseCSV;
