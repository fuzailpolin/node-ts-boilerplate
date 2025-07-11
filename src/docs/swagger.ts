import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Node TS Boilerplate API",
    version: "1.0.0",
  },
};

const options = {
  swaggerDefinition,
  apis: ["src/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

export default specs;
