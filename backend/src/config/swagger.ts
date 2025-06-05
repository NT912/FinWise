import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinWise API Documentation",
      version: "1.0.0",
      description: "API documentation for FinWise application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
      {
        url: "http://3.0.248.48:3000",
        description: "Production Server",
      },
      {
        url: "http://192.168.2.15:3002",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve);
  app.use("/api-docs", swaggerUi.setup(specs));
};

export { specs, swaggerUi, setupSwagger };
