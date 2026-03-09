let cached = null;

function truthyEnv(name) {
  const v = String(process.env[name] ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function getApp() {
  if (cached) return cached;

  cached = (async () => {
    // Import compiled backend output (built via root buildCommand on Vercel).
    const [{ default: app }, { connectMongo }] = await Promise.all([
      import("../backend/dist/app.js"),
      import("../backend/dist/db/mongo.js")
    ]);

    const requireMongo = truthyEnv("REQUIRE_MONGO");
    const useMemory = truthyEnv("USE_MEMORY_DB");

    if (!useMemory) {
      try {
        await connectMongo();
      } catch (err) {
        if (requireMongo) throw err;
        // Keep the API functional even without Mongo (note: data won't persist across cold starts).
        process.env.USE_MEMORY_DB = "true";
      }
    }

    return app;
  })();

  return cached;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}


