import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectMongo } from "./db/mongo.js";
dotenv.config();
const port = Number(process.env.PORT ?? 4000);
const app = createApp();
const mem = String(process.env.USE_MEMORY_DB ?? "").trim().toLowerCase();
const useMemory = mem === "1" || mem === "true" || mem === "yes";
const requireMongo = (() => {
    const v = String(process.env.REQUIRE_MONGO ?? "").trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes";
})();
const listen = () => {
    const server = app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`HRMS Lite API listening on port ${port}${useMemory ? " (memory DB)" : ""}`);
    });
    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            // eslint-disable-next-line no-console
            console.error(`Port ${port} is already in use. Stop the other process or run with a different port, e.g. PORT=${port + 1} npm run dev`);
            process.exit(1);
        }
        // eslint-disable-next-line no-console
        console.error("Failed to start server", err);
        process.exit(1);
    });
};
if (useMemory) {
    listen();
}
else {
    connectMongo()
        .then(listen)
        .catch((err) => {
        if (requireMongo) {
            // eslint-disable-next-line no-console
            console.error("Failed to connect to MongoDB (REQUIRE_MONGO=true) — exiting.", err);
            process.exit(1);
        }
        // Dev-friendly fallback: keep the API alive so the frontend doesn't show "Network Error".
        // eslint-disable-next-line no-console
        console.warn("Failed to connect to MongoDB — falling back to in-memory DB. Set REQUIRE_MONGO=true to disable.", err);
        process.env.USE_MEMORY_DB = "true";
        listen();
    });
}
