import type { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: "Route not found",
      details: {
        method: req.method,
        path: req.originalUrl,
        hint: req.originalUrl.startsWith("/api/")
          ? "Check the endpoint path/method."
          : "API routes are under /api/* (e.g. /api/health). If you expected the UI, open the frontend server (typically http://localhost:5173)."
      }
    }
  });
}


