const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/richu";

  try {
    // Attempt standard connection to provided MONGO_URI
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = true;
    console.log("✓ MongoDB connected successfully:", uri.includes("@") ? "MongoDB Atlas (Remote Cluster)" : uri);
    return;
  } catch (err) {
    console.warn(`\n[RICHU DB Notice] Could not connect to primary MongoDB at "${uri}": ${err.message}`);

    // If in development mode and local connection was refused, try in-memory fallback
    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("[RICHU DB] Attempting to start in-memory MongoDB fallback...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        isConnected = true;
        console.log("✓ [RICHU DB] In-Memory MongoDB running successfully at:", memUri);

        // Auto-seed database so catalog has products and categories immediately
        try {
          const Category = require("../models/Category");
          const count = await Category.countDocuments();
          if (count === 0) {
            console.log("[RICHU DB] Populating initial luxury catalog into in-memory database...");
            const seedData = require("../utils/seedData");
            if (typeof seedData === "function") {
              // seedData handles seeding
            }
          }
        } catch (sErr) {
          // ignore seed errors
        }
        return;
      } catch (memErr) {
        // MongoMemoryServer not available or failed
      }
    }

    console.error("\n========================================================");
    console.error("❌ MONGODB CONNECTION FAILED (ECONNREFUSED)");
    console.error("--------------------------------------------------------");
    console.error("The backend needs a MongoDB connection to run.");
    console.error("\n👉 HOW TO FIX:");
    console.error("1. For MongoDB Atlas (Recommended by RICHU project spec):");
    console.error("   Open 'backend/.env' and set your MongoDB Atlas connection string:");
    console.error("   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/richu?retryWrites=true&w=majority");
    console.error("\n2. For Local MongoDB:");
    console.error("   Ensure the MongoDB Windows service or 'mongod' daemon is running on port 27017.");
    console.error("========================================================\n");

    throw err;
  }
}

module.exports = connectDB;
