import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";
function isMongoDuplicateKeyError(err) {
    return (typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof err.code === "number" &&
        err.code === 11000);
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                message: "Validation error",
                details: err.issues
            }
        });
    }
    // Mongo unique constraint violation (duplicate key)
    if (isMongoDuplicateKeyError(err)) {
        return res.status(409).json({
            error: { message: "Duplicate value violates a unique constraint", details: err.keyValue }
        });
    }
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: { message: err.message, details: err.details } });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: { message: "Internal server error" } });
}
