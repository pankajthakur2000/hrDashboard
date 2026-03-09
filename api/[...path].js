import app from "../backend/dist/app.js";
import { connectMongo } from "../backend/dist/db/mongo.js";

let initPromise = null;

function truthyEnv(name) {
  const v = String(process.env[name] ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function ensureInit() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const requireMongo = truthyEnv("REQUIRE_MONGO");
    const useMemory = truthyEnv("USE_MEMORY_DB");

    if (!useMemory) {
      try {
        await connectMongo();
      } catch (err) {
        if (requireMongo) throw err;
        // Keep the API functional even without Mongo (data won't persist across cold starts).
        process.env.USE_MEMORY_DB = "true";
      }
    }
  })();
  return initPromise;
}

export default async function handler(req, res) {
  await ensureInit();
  return app(req, res);
}


