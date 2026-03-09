import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { employeesRouter } from "./routes/employees.js";
import { attendanceRouter } from "./routes/attendance.js";
import { summaryRouter } from "./routes/summary.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
export function createApp() {
    const app = express();
    const frontendOrigin = process.env.FRONTEND_ORIGIN;
    const allowedOrigins = frontendOrigin
        ? frontendOrigin
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;
    app.use(cors({
        origin: allowedOrigins ?? true,
        credentials: false
    }));
    app.use(helmet());
    app.use(express.json({ limit: "1mb" }));
    app.use(morgan("dev"));
    // Helpful landing route so opening the backend URL in a browser doesn't look "broken".
    app.get("/", (_req, res) => {
        res.json({
            ok: true,
            service: "HRMS Lite API",
            health: "/api/health"
        });
    });
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    app.use("/api/summary", summaryRouter);
    app.use("/api/employees", employeesRouter);
    app.use("/api/attendance", attendanceRouter);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
// Vercel's Node runtime expects the default export of this module
// to be a request handler function or a server-like object.
// Export a singleton Express app instance as the default.
const app = createApp();
export default app;
