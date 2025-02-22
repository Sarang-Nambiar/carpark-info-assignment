// Extract the batch job name from the first column in the csv file
// Then perform the batch job
const { insertData, updateData, deleteData, runQuery } = require("./lib/db");

async function batch_job(rows) {
    await runQuery("BEGIN TRANSACTION");    
    try {
        for (const row of rows) {
            const batch_job_name = row[0];
            switch (batch_job_name) {
                case "INSERTED":
                    await insertData(row.slice(1)); // Remove the header.
                    break;
                case "UPDATED":
                    await updateData(row.slice(1));
                    break;
                case "DELETED":
                    await deleteData(row.slice(1));
                    break;
                default:
                    console.error("Invalid batch job name");
            }
        }
        console.log("All modifications from the delta file have been successfully implemented.")
        await runQuery("COMMIT");  
    } catch (err) {
        console.error("Error occurred while processing batch job: ", err);
        await runQuery("ROLLBACK");
    }
}

module.exports = batch_job;