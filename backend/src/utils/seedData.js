require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");

const sampleCategories = [
  {
    name: "Bespoke Suiting & Tuxedos",
    slug: "bespoke-suiting-tuxedos",
    description: "Hand-padded lapels and full-canvas drape tailored to perfection.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcX549ALZSsMVDlxWa_cZgwpiae4y0DEpq-dsmlPel3qaT5nVrQqyXjnyiFYzDCOXNeh4lVOdebieW6eATtJYBhoacUYpCbJ9Y90khBTVqD0HVco6cAHs84cVY0AcFY336n90emvG53phkyVYhKEjeozV_eJkSMG7PuP14rkbhV1nZ2_K6jLwrf_iNpuxyjvyDHvl2QHwYhJzDQ9A10TV39zzQjPulN5bWD1Ikcdva",
    isActive: true
  },
  {
    name: "Luxury Cashmere & Knitwear",
    slug: "luxury-cashmere-knitwear",
    description: "Mongolian grade-A pure yarn knitwear for effortless winter warmth.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYYzdb2EWyK8IBFH0xRgR7ZloeMyXMmWQS9OhNPpx-YfBKrzMpSx1Z52JOW8r4Ew3PcDZ28LA4akWKnx33zGHpOC6iu28O1clo9V4grk506gD5sKoNvu5kMSlr-vrGgDZz6o9FohYImIYE44YprDTKmp8n7qYe78JKGIVg-JFPNIdiCnbI40sVBPeXkUcwZYZUJxreVF2MK1TvHSUKtrvNBCDmiba9aychSsHeRatt",
    isActive: true
  },
  {
    name: "Handcrafted Italian Footwear",
    slug: "handcrafted-italian-footwear",
    description: "Goodyear-welted calfskin and burnished patina masterpieces.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsLUmKKC4nCVClLNNqkXLrt5R6urOelrleUaJIgg4JjQb_nUOlpRpGKWn84kzIbrk-VUNcfjMB9EyIupwi9L_OvzQ2maTQAKhZsgpBBWuhOL2xP2mAup_BbAjEGIAKLL5zzCmzzXN3yda58JQpqdHQHGtDRigopLjm5K5yP0niz16x-ChMdGc5ley9RhxRP7RBW676ER3Qgw82pWF7bLSlLUia-8R04pH-nRT2A6d5",
    isActive: true
  },
  {
    name: "Artisanal Leather & Accessories",
    slug: "artisanal-leather-accessories",
    description: "Fine silk squares, solid brass cufflinks, and full-grain travel gear.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgrQ5FVShgUZOC3-zLH125F7SpMS7XgozIYuJpFgf6V5U8d01PCoqTMalC4NPgkLSv_BRLsOOJ1uZXw5VnCiHGEISB48zWYSeJCpyLYuXab1iMrTtTI8wE-6jysinCOEqcxTjd3xaWJP_OUcEy_eH3O6Qbx3f1qK-t76EVDbfQXkWtxvOBV8t4ngP6XZFuPe7yCEN4HG6teHvPGhklLlOK271e8bsx4RvqPTu2u9nL",
    isActive: true
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/richu";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed or find Categories
    const categoriesMap = {};
    for (const catData of sampleCategories) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
      }
      categoriesMap[catData.slug] = category._id;
    }

    // 2. Seed Sample Products
    const sampleProducts = [
      {
        name: "Midnight Navy Double-Breasted Suit",
        slug: "midnight-navy-double-breasted-suit",
        description: "Impeccably tailored double-breasted suit cut from pure Super 150s Merino wool with hand-padded peak lapels, cupro silk lining, and natural carved buffalo horn buttons. Made with authentic Savile Row bespoke construction.",
        category: categoriesMap["bespoke-suiting-tuxedos"],
        brand: "RICHU Atelier",
        price: 2850,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDYDDo8MVMK2kXAM9h8RVRAzp7ac3V7Vjt1loiCsGF2tFL6uVW2RqeOEMKYU9Or6WRQbW776xgP2TZgravGml_7agsR8uIZw-lSgHnuuL-iLDDiXYAf1Yekk0Qkfa3z-5TgDsWGqbtbkH5WobMhjmqDcS3LcuwcLGkQ1a6A4lo11qCG7Ywi8GmYMOUYrTYwkKEqK33HQs4kDVXSF_WS2xLrLAHB6fCI4qy1r5iIbJ1F",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBPn9Nrq2PtcEmNa61qskVspGBCz20tO6ckAU1VGTOS_tfVIRVb4YaeFny4MZsaw_QQPM3dsSiW_SErNrT-bwz8BwLNsSAPpmLG8K8VVZdoyzeG6znrBiChYdoaTYa-dda360bALTB4KHBsa6gNbS9muNpzPUu1ikfgbTQKcohjWK6yqh1s2jmwStU3hy2-V8Ep-tG0sMG7CjgfI8jXsXxQzh6KiWQlYjbedkkJFC8f",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBs_WYkMpYh54J8wicU854MSf5l2RFN48Gykdkqw6qycR0AUkqGrK6RnA-zRVLkE-iT1RtqBxGu8VnrV1K794j_RYBsY2I7MdSJXe5TxtMqsTHG6vnecrPqZL4bDrqPw0IUUdE12_jfuckgrbSawPUpTabfVq8stB1v6caDR0U8veyj7de3sAO_gXdzPywIfbvIgcSTC5J6G6CdA6zutXBfGQSHtjFfLSofOgn3-CKC",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuALCfSm-E-IivE6trx2i5VVYPVpc0IR5u-z21w6R9XPxdI3uDHh38Gyt7s15Djwyq08v-tvw5Rpkd5ijwRZ3xyJ-6P_y2ThYy4VjkU4WsLOiACCvWJX7OWpgbFHxNsJmkAVBRouWcAxmIuJoqga8a_HZ1wym6IoZXC20luLY_oTnH0uxDKvgZ0Uzi838qX6aUAYISisONXDl079nCOOqDXWfLDlt5OFwutFftkzvAh"
        ],
        variants: [
          { size: "S", color: "Midnight Navy", sku: "RCH-MNS-S", stock: 8 },
          { size: "M", color: "Midnight Navy", sku: "RCH-MNS-M", stock: 12 },
          { size: "L", color: "Midnight Navy", sku: "RCH-MNS-L", stock: 10 },
          { size: "XL", color: "Midnight Navy", sku: "RCH-MNS-XL", stock: 6 },
          { size: "XXL", color: "Midnight Navy", sku: "RCH-MNS-XXL", stock: 4 }
        ],
        isActive: true
      },
      {
        name: "Midnight Navy Velvet Dinner Tuxedo",
        slug: "midnight-navy-velvet-dinner-tuxedo",
        description: "Opulent Italian cotton-silk velvet dinner jacket featuring contrasting grosgrain shawl lapels, silk-faced jetted pockets, and tailored modern drop.",
        category: categoriesMap["bespoke-suiting-tuxedos"],
        brand: "RICHU Black Label",
        price: 2450,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAs1OyPi5g2YtxaWpL-bg4QnBMrgl8JRQCUysOsFVyOxG7k5R6qkTYIihfgcM0ueRlXxG3xt4V4vmZeiYFth5Wqpojcdy7F3oLpD0M_ZxYGUoIs--rWSk-uyZOglWJVFL0DtYts7_Ft5AZx6bzK8uFnXxL8uKEKYE2deVZy0XcT8qqW98jSOHnH-mesOVvqgt9_xDldJ2gT8igUtcgHfYJrfmGfrwMjQNujiMynKiOj"
        ],
        variants: [
          { size: "S", color: "Deep Velvet Navy", sku: "RCH-VTX-S", stock: 5 },
          { size: "M", color: "Deep Velvet Navy", sku: "RCH-VTX-M", stock: 9 },
          { size: "L", color: "Deep Velvet Navy", sku: "RCH-VTX-L", stock: 7 },
          { size: "XL", color: "Deep Velvet Navy", sku: "RCH-VTX-XL", stock: 3 }
        ],
        isActive: true
      },
      {
        name: "Double-Breasted Wool & Cashmere Overcoat",
        slug: "double-breasted-wool-cashmere-overcoat",
        description: "Heavyweight 680gsm melange wool and pure cashmere blend. Features peak lapels, deep vented back for fluidity in movement, and hand-warmer flap pockets.",
        category: categoriesMap["bespoke-suiting-tuxedos"],
        brand: "RICHU Sartoria",
        price: 1890,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBxmq-q87wS5p8G7j8g_VQxnUosoN3fM3Tssw-kThY91S_tb9KpaUMaXn-51HGAGsIqJd2ZGkPMKkQuaWqZ73jTMW34F3ozNAJGINS1qIwnOOr_KCWCRtY96fcldGQVodmoisPfac6JDR0imHv9BdDzQq7hjUoES68Rs8bXFvGbUe-goTLU3FiegkbQ4rlN_3fnWH5Fw9zWyH51qh7RbNS0oySw3V7kB_0omUSIMhYy"
        ],
        variants: [
          { size: "M", color: "Camel Charcoal", sku: "RCH-WCO-M", stock: 10 },
          { size: "L", color: "Camel Charcoal", sku: "RCH-WCO-L", stock: 14 },
          { size: "XL", color: "Camel Charcoal", sku: "RCH-WCO-XL", stock: 6 }
        ],
        isActive: true
      },
      {
        name: "Champagne Mulberry Silk Evening Shirt",
        slug: "champagne-mulberry-silk-evening-shirt",
        description: "100% Grade 6A Mulberry silk woven in Lake Como. Finished with natural mother-of-pearl buttons and discreet French cuffs designed for cufflinks.",
        category: categoriesMap["luxury-cashmere-knitwear"],
        brand: "RICHU Atelier",
        price: 520,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCXHKiYG30dzeI0iKGNnbm_S_jOU5h7mOao3wx1C4q6RGsL2ZXmO6uXGhSO8LsxXUzIEPw6RTdrYIsdnutC6MvX-6LlkLXgfpYDMJcCRPZOzcQrvfPx0oRTJFS0hbamPZQ4hOQm03cSJx7Viqjskgq-9zLwmrH8AZqC1kYvuMtERFieqW1s0jyuQfgmMdEwuTsrRujxWPymHsOaZfz5VgEqo-kpcAK30WSbYcY6ppy0"
        ],
        variants: [
          { size: "S", color: "Champagne Gold", sku: "RCH-SS-S", stock: 12 },
          { size: "M", color: "Champagne Gold", sku: "RCH-SS-M", stock: 15 },
          { size: "L", color: "Champagne Gold", sku: "RCH-SS-L", stock: 11 },
          { size: "XL", color: "Champagne Gold", sku: "RCH-SS-XL", stock: 8 }
        ],
        isActive: true
      },
      {
        name: "Hand-Burnished Monkstrap Italian Shoes",
        slug: "hand-burnished-monkstrap-italian-shoes",
        description: "Goodyear-welted full-grain Tuscan calfskin with deep espresso hand-patina finish. Accented by solid polished brass buckle closures and channel-stitched oak bark leather soles.",
        category: categoriesMap["handcrafted-italian-footwear"],
        brand: "RICHU Calzatura",
        price: 780,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBAtZmgnBjRknkNz1Ldc8oUYGSKEfXm-aC9Y4DTKpc4lQptDD1ue47vWDOw07nHKa2ONWG8qJ0IXyN-Qwl04b8oas0TEQznBnwkAoYx1gPeGrE2i2eeBQd64Ei2I_4McSHSbCMWoYP8k7hgJS2lDpGaZ04GYgpC9uXkXvn9S12qrONlzZFSyzzg2uBxKRWeHUXjugpSBQApX1Flg375Cpop-6rRPJaD_vrneHHelpQm"
        ],
        variants: [
          { size: "S", color: "Espresso Patina", sku: "RCH-MS-S", stock: 6 },
          { size: "M", color: "Espresso Patina", sku: "RCH-MS-M", stock: 8 },
          { size: "L", color: "Espresso Patina", sku: "RCH-MS-L", stock: 7 },
          { size: "XL", color: "Espresso Patina", sku: "RCH-MS-XL", stock: 4 }
        ],
        isActive: true
      },
      {
        name: "Pure White Royal Oxford Dress Shirt",
        slug: "pure-white-royal-oxford-dress-shirt",
        description: "Two-ply 120s Egyptian Giza cotton cut with high spread collar, clean French placket, and carved Australian mother-of-pearl buttons.",
        category: categoriesMap["luxury-cashmere-knitwear"],
        brand: "RICHU Atelier",
        price: 340,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBNFzMQJhBSazAwx6Vax4eBTaVUupgIEJQGOt0HQRsnyk3RGnijBcElqKANrk5W0Z7R2kAwEdspmosn_LLlD-8NDeOet3JZEw07GOLSpa6nWR2xCV_EwISuffhS9aAFijaLe0348th5DYcU-63zFZhusUVfc38UyJcFxt6YpQRFUJzqxWIDExLEYzNivM_R-qrZPL76flgXSIqMODB5GLtrtGqW8Nltw33o8Yst_WJE"
        ],
        variants: [
          { size: "S", color: "Pure White", sku: "RCH-ROX-S", stock: 15 },
          { size: "M", color: "Pure White", sku: "RCH-ROX-M", stock: 20 },
          { size: "L", color: "Pure White", sku: "RCH-ROX-L", stock: 18 },
          { size: "XL", color: "Pure White", sku: "RCH-ROX-XL", stock: 9 }
        ],
        isActive: true
      },
      {
        name: "Loro Piana™ Archival Silk-Wool Blazer",
        slug: "loro-piana-archival-silk-wool-blazer",
        description: "Archival specimen tailored from Loro Piana™ Super 180s wool and mulberry silk. Unstructured shoulders, horn buttons, and handcrafted patch pockets.",
        category: categoriesMap["bespoke-suiting-tuxedos"],
        brand: "RICHU Atelier",
        price: 3200,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB-1hod0IPOth-hpTwy-jCOl8eVXCpZxZ842wRaoJvEsSzLSohhsLBv2rTjgsphZ9_jK99puqyRAEyBqkQTWbhkBPJt3uf1avl7wNClNosPAylrnSXZhNQmnc0zbfMEJWT2dMSERKjp8uf1muOnMeM0QJW7PRJYOax5whaXla2SyaUOFMd6SJu12cgWsX5JVoTHv7meR_xEnB2iVdn829Hn6sSN1ZIkTD_Fhc-0rh9B"
        ],
        variants: [
          { size: "S", color: "Midnight Pinstripe", sku: "RCH-LPB-S", stock: 3 },
          { size: "M", color: "Midnight Pinstripe", sku: "RCH-LPB-M", stock: 5 },
          { size: "L", color: "Midnight Pinstripe", sku: "RCH-LPB-L", stock: 4 },
          { size: "XL", color: "Midnight Pinstripe", sku: "RCH-LPB-XL", stock: 2 }
        ],
        isActive: true
      },
      {
        name: "Full-Grain Leather Grand Tour Duffle",
        slug: "full-grain-leather-grand-tour-duffle",
        description: "Hand-stitched vegetable-tanned French calfskin weekender travel bag with solid antiqued brass hardware, reinforced leather corners, and padded shoulder strap.",
        category: categoriesMap["artisanal-leather-accessories"],
        brand: "RICHU Pelletteria",
        price: 1450,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAgrQ5FVShgUZOC3-zLH125F7SpMS7XgozIYuJpFgf6V5U8d01PCoqTMalC4NPgkLSv_BRLsOOJ1uZXw5VnCiHGEISB48zWYSeJCpyLYuXab1iMrTtTI8wE-6jysinCOEqcxTjd3xaWJP_OUcEy_eH3O6Qbx3f1qK-t76EVDbfQXkWtxvOBV8t4ngP6XZFuPe7yCEN4HG6teHvPGhklLlOK271e8bsx4RvqPTu2u9nL"
        ],
        variants: [
          { size: "M", color: "Obsidian Black", sku: "RCH-GTD-M", stock: 10 },
          { size: "L", color: "Cognac Tan", sku: "RCH-GTD-L", stock: 8 }
        ],
        isActive: true
      }
    ];

    for (const p of sampleProducts) {
      const exists = await Product.findOne({ slug: p.slug });
      if (!exists) {
        await Product.create(p);
      }
    }

    // 3. Seed demo customer user if not exists
    const demoEmail = "customer@richu.co";
    let customer = await User.findOne({ email: demoEmail });
    if (!customer) {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      customer = await User.create({
        name: "Lord Edward Vance",
        email: demoEmail,
        password: hashedPassword,
        phone: "+44 20 7946 0912",
        role: "customer",
        isEmailVerified: true,
        accountStatus: "ACTIVE",
        addresses: [
          {
            fullName: "Lord Edward Vance",
            phone: "+44 20 7946 0912",
            street: "14 Grosvenor Square, Mayfair",
            city: "London",
            state: "Greater London",
            pincode: "W1K 6LG",
            addressType: "HOME",
            isDefault: true
          },
          {
            fullName: "Lord Edward Vance",
            phone: "+44 20 7946 0912",
            street: "Via Monte Napoleone 8",
            city: "Milan",
            state: "Lombardy",
            pincode: "20121",
            addressType: "WORK",
            isDefault: false
          }
        ]
      });
      console.log("Demo customer created: customer@richu.co / Password123!");
    }

    // 4. Seed sample reviews
    const suit = await Product.findOne({ slug: "midnight-navy-double-breasted-suit" });
    if (suit && customer) {
      await Review.findOneAndUpdate(
        { user: customer._id, product: suit._id },
        {
          rating: 5,
          comment: "The cut of the double-breasted tuxedo is architectural mastery. It commands rooms effortlessly without screaming for validation. The hand-padded lapel drape is pure poetry.",
          isVerifiedPurchase: true
        },
        { upsert: true }
      );
    }

    console.log("RICHU luxury catalog seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
