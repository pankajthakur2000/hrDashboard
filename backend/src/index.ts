import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectMongo } from "./db/mongo.js";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

const mem = String(process.env.USE_MEMORY_DB ?? "").trim().toLowerCase();
const useMemory = mem === "1" || mem === "true" || mem === "yes";

const listen = () => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`HRMS Lite API listening on port ${port}${useMemory ? " (memory DB)" : ""}`);
  });
};

if (useMemory) {
  listen();
} else {
  connectMongo()
    .then(listen)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    });
}


