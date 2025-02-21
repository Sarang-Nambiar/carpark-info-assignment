const express = require('express');
const app = express();  
const cors = require('cors');
const { getAllQuery, getQuery } = require('./lib/db');
const PORT = 8000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});