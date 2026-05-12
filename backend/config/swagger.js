const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Amdox ERP API',
      version: '1.0.0',
      description: 'API documentation for the Amdox ERP System. Use the Authorize button to provide your Bearer token for protected routes.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
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
    // This applies the security globally, but you can override it per route
    security: [{ bearerAuth: [] }],
  },
  // Look for Swagger comments in all route files
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;