require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { validateRegistration } = require("../src/validators/authValidator");

async function provisionAdmin() {
  const input = validateRegistration({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE,
    password: process.env.ADMIN_PASSWORD
  });

  await connectDB();
  if (await User.exists({ email: input.email })) {
    throw new Error("An account with this email already exists; refusing to promote it automatically");
  }

  await User.create({
    ...input,
    password: await bcrypt.hash(input.password, 12),
    role: "admin"
  });
  console.log(`Admin account provisioned for ${input.email}`);
}

provisionAdmin()
  .catch((error) => {
    console.error(`Admin provisioning failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
