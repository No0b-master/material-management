const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'MRMS API', version: '1.0.0' },
    servers: [{ url: '/'}],
  },
  apis: [__dirname + '/../controllers/*.js', __dirname + '/../routes/*.js'],
};

const spec = swaggerJsdoc(options);
router.use('/', swaggerUi.serve, swaggerUi.setup(spec));

module.exports = router;
