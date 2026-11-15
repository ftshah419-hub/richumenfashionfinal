require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const AdminAuditLog = require("../models/AdminAuditLog");

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is missing from backend/.env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // 1. Seed or update Admin User
    const adminEmail = "admin@richu.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("Admin@123456", 12);
      admin = await User.create({
        name: "Vittorio De Luca",
        email: adminEmail,
        password: hashedPassword,
        phone: "+91 98765 43210",
        role: "admin",
        isEmailVerified: true,
        accountStatus: "ACTIVE"
      });
      console.log("Created Administrator Account: admin@richu.com (Password: Admin@123456)");
    } else {
      admin.role = "admin";
      admin.accountStatus = "ACTIVE";
      await admin.save();
      console.log("Admin account verified: admin@richu.com");
    }

    // 2. Seed Default Categories if none exist
    const categoryCount = await Category.countDocuments();
    let suitingCat, outerwearCat, shirtsCat;
    if (categoryCount === 0) {
      suitingCat = await Category.create({
        name: "Bespoke Suiting",
        slug: "bespoke-suiting",
        description: "Hand-canvassed sartorial suits cut from Savile Row and Biella wools.",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
        isActive: true
      });

      outerwearCat = await Category.create({
        name: "Outerwear & Overcoats",
        slug: "outerwear-overcoats",
        description: "Double-faced cashmere and storm-system alpaca overcoats.",
        image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
        isActive: true
      });

      shirtsCat = await Category.create({
        name: "Formal Shirts",
        slug: "formal-shirts",
        description: "Egyptian Giza cotton and Sea Island 160s bespoke shirting.",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80",
        isActive: true
      });
      console.log("Seeded 3 foundational categories.");
    } else {
      suitingCat = await Category.findOne({ slug: "bespoke-suiting" }) || await Category.findOne();
    }

    // 3. Seed Sample Product if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0 && suitingCat) {
      const sampleProduct = await Product.create({
        name: "Midnight Navy Royal Double-Breasted Suit",
        slug: "midnight-navy-royal-double-breasted-suit",
        description: "Full floating canvas construction, peak lapels, horn buttons, cut from Super 150s Australian merino wool.",
        category: suitingCat._id,
        brand: "RICHU",
        price: 48500,
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
        ],
        variants: [
          { size: "S", color: "Midnight Navy", sku: "RIC-SUIT-001-S", stock: 6 },
          { size: "M", color: "Midnight Navy", sku: "RIC-SUIT-001-M", stock: 12 },
          { size: "L", color: "Midnight Navy", sku: "RIC-SUIT-001-L", stock: 8 },
          { size: "XL", color: "Midnight Navy", sku: "RIC-SUIT-001-XL", stock: 4 }
        ],
        isActive: true
      });

      await AdminAuditLog.create({
        admin: admin._id,
        action: "INITIAL_SEED",
        targetType: "PRODUCT",
        targetId: sampleProduct._id,
        details: "Initial showroom product and inventory seeded"
      });
      console.log("Seeded sample garment product with 4 variants.");
    }

    console.log("\n>>> SEEDING COMPLETE! <<<");
    console.log("Admin Login: admin@richu.com");
    console.log("Password:    Admin@123456");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
