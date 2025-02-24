const express = require('express');
const app = express();  
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Routes
const freeParkingRoute = require('./routes/freeParking');
const nightParkingRoute = require('./routes/nightParking');
const heightLimitRoute = require('./routes/heightLimit');
const batchJobRoute = require('./routes/batchJob');
const favoritesRoute = require('./routes/favorites');

const PORT = process.env.PORT || 8000;

app.use(cors());

// Swagger config
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Car Park API',
            version: '1.0.0',
            description: 'API documentation for car park info',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
   components: {
     securitySchemes: {
         bearerAuth: {
             type: 'http',
             scheme: 'bearer',
             bearerFormat: 'JWT', 
         },
     },
 },
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

app.use("/filter/free_parking", freeParkingRoute);
app.use("/filter/night_parking", nightParkingRoute);
app.use("/filter/height_limit", heightLimitRoute);
// Expects a delta file in the format provided in the README
app.use("/batch_job", batchJobRoute);
// Request query should contain the car park number and the user ID of the user who favorited the car park
app.use("/add/favorite", favoritesRoute);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});