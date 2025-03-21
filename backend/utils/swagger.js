import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import fs from "fs";

const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));

// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Inventory & Sales API",
//       version: "1.0.0",
//       description: "API documentation for the Inventory & Sales system",
//     },
//     servers: [{ url: "http://localhost:5000" }],
//   },
//   apis: ["../routes/*.js"],
// };

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
