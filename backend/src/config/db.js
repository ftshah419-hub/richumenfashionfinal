const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Atlas connected");
}

module.exports = connectDB;
