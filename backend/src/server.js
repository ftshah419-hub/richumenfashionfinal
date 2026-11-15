require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
      throw new Error("JWT_SECRET must be set to a secure value");
    }
    await connectDB();
    app.listen(PORT, () => console.log(`RICHU API running on port ${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
