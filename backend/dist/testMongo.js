import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
// Use the same URI as the rest of the app
const uri = process.env.MONGODB_URI;
if (!uri) {
    // eslint-disable-next-line no-console
    console.error("MONGODB_URI is not set. Please add it to your .env file.");
    process.exit(1);
}
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        // eslint-disable-next-line no-console
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB test connection failed", err);
    process.exit(1);
});
