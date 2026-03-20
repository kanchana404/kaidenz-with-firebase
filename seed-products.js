const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const fs = require("fs");

// Init firebase-admin
const serviceAccountPath = path.join(__dirname, "service-account.json");
initializeApp({
  credential: cert(serviceAccountPath),
  projectId: "kaidenz",
  storageBucket: "kaidenz.firebasestorage.app",
});

const db = getFirestore();
const bucket = getStorage().bucket("kaidenz.firebasestorage.app");

const IMAGES_DIR = "/Users/kavitha/Public/Development/Android/images";

// ─── CATEGORIES ──────────────────────────────────────────────
const CATEGORIES = [
  { name: "Men", description: "Men's clothing" },
  { name: "Women", description: "Women's clothing" },
  { name: "Unisex", description: "Unisex clothing" },
  { name: "Activewear", description: "Sports & activewear" },
  { name: "Outerwear", description: "Jackets & coats" },
  { name: "Accessories", description: "Accessories & extras" },
  { name: "Intimates", description: "Underwear & lingerie" },
];

// ─── SIZES ───────────────────────────────────────────────────
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// ─── COLORS ──────────────────────────────────────────────────
const COLORS = [
  // Reds
  { name: "Coral Red", hexCode: "#f87171" },
  { name: "True Red", hexCode: "#ef4444" },
  { name: "Bold Red", hexCode: "#dc2626" },
  { name: "Dark Red", hexCode: "#b91c1c" },
  // Rose
  { name: "Rose Pink", hexCode: "#fb7185" },
  { name: "Hot Rose", hexCode: "#f43f5e" },
  { name: "Wine Rose", hexCode: "#9f1239" },
  // Pink
  { name: "Baby Pink", hexCode: "#fbcfe8" },
  { name: "Hot Pink", hexCode: "#ec4899" },
  { name: "Fuchsia Pink", hexCode: "#db2777" },
  // Orange
  { name: "Peach", hexCode: "#fdba74" },
  { name: "True Orange", hexCode: "#f97316" },
  { name: "Burnt Orange", hexCode: "#ea580c" },
  { name: "Rust", hexCode: "#c2410c" },
  // Amber
  { name: "Golden Yellow", hexCode: "#fcd34d" },
  { name: "True Amber", hexCode: "#f59e0b" },
  { name: "Dark Amber", hexCode: "#d97706" },
  { name: "Caramel", hexCode: "#b45309" },
  { name: "Bronze", hexCode: "#92400e" },
  // Yellow
  { name: "Lemon Yellow", hexCode: "#fde047" },
  { name: "Bright Yellow", hexCode: "#facc15" },
  { name: "Mustard Yellow", hexCode: "#eab308" },
  // Green
  { name: "Mint Green", hexCode: "#86efac" },
  { name: "True Green", hexCode: "#22c55e" },
  { name: "Forest Green", hexCode: "#16a34a" },
  { name: "Dark Green", hexCode: "#15803d" },
  // Emerald
  { name: "Emerald", hexCode: "#34d399" },
  { name: "Deep Emerald", hexCode: "#059669" },
  // Teal
  { name: "Teal", hexCode: "#2dd4bf" },
  { name: "Deep Teal", hexCode: "#0d9488" },
  // Cyan
  { name: "Cyan", hexCode: "#22d3ee" },
  { name: "Deep Cyan", hexCode: "#0891b2" },
  // Sky Blue
  { name: "Sky Blue", hexCode: "#38bdf8" },
  { name: "Bright Sky", hexCode: "#0ea5e9" },
  // Blue
  { name: "Baby Blue", hexCode: "#93c5fd" },
  { name: "True Blue", hexCode: "#3b82f6" },
  { name: "Royal Blue", hexCode: "#2563eb" },
  { name: "Navy Blue", hexCode: "#1e40af" },
  { name: "Dark Navy", hexCode: "#1e3a8a" },
  // Indigo
  { name: "Soft Indigo", hexCode: "#818cf8" },
  { name: "True Indigo", hexCode: "#6366f1" },
  { name: "Dark Indigo", hexCode: "#312e81" },
  // Violet
  { name: "Lavender", hexCode: "#c4b5fd" },
  { name: "True Violet", hexCode: "#8b5cf6" },
  { name: "Deep Violet", hexCode: "#7c3aed" },
  // Purple
  { name: "Lilac", hexCode: "#d8b4fe" },
  { name: "True Purple", hexCode: "#a855f7" },
  { name: "Royal Purple", hexCode: "#7e22ce" },
  // Fuchsia
  { name: "True Fuchsia", hexCode: "#d946ef" },
  { name: "Deep Fuchsia", hexCode: "#c026d3" },
  // Neutrals
  { name: "Off White", hexCode: "#f5f5f5" },
  { name: "Light Gray", hexCode: "#e5e5e5" },
  { name: "Silver", hexCode: "#d4d4d4" },
  { name: "Charcoal Gray", hexCode: "#737373" },
  { name: "Dark Gray", hexCode: "#525252" },
  { name: "Near Black", hexCode: "#262626" },
  { name: "Jet Black", hexCode: "#171717" },
  // Stone / Beige
  { name: "Cream", hexCode: "#f5f5f4" },
  { name: "Beige", hexCode: "#d6d3d1" },
  { name: "Taupe", hexCode: "#a8a29e" },
  { name: "Dark Taupe", hexCode: "#57534e" },
  { name: "Espresso", hexCode: "#44403c" },
  { name: "Dark Brown", hexCode: "#292524" },
];

// ─── PRODUCTS ────────────────────────────────────────────────
// category: references one of the CATEGORIES above by name
// colors: subset of color names from COLORS above
const PRODUCTS = [
  {
    name: "Men's Crew Neck T-Shirt",
    category: "Men",
    description: "Classic crew neck t-shirt in soft cotton. A wardrobe essential for everyday comfort and style.",
    basePrice: 1500,
    colors: ["Navy Blue", "Jet Black", "Off White", "True Red", "Forest Green"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Women's Crop Top",
    category: "Women",
    description: "Trendy crop top perfect for casual outings and layering. Lightweight and breathable fabric.",
    basePrice: 1200,
    colors: ["Hot Pink", "Off White", "Jet Black", "Lavender"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Unisex Oversized Hoodie",
    category: "Unisex",
    description: "Cozy oversized hoodie with kangaroo pocket. Perfect for layering in cooler weather.",
    basePrice: 3500,
    colors: ["Charcoal Gray", "Navy Blue", "Beige", "Dark Green"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Button-Up Casual Shirt",
    category: "Men",
    description: "Smart casual button-up shirt. Versatile enough for work or weekend outings.",
    basePrice: 2800,
    colors: ["Sky Blue", "Off White", "Dark Navy", "Beige"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Sleeveless Tank Top",
    category: "Unisex",
    description: "Lightweight sleeveless tank top ideal for workouts and warm weather.",
    basePrice: 900,
    colors: ["Jet Black", "Off White", "True Red", "Navy Blue", "Mint Green"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Basic Long Sleeve Tee",
    category: "Men",
    description: "Essential long sleeve tee in premium cotton. Comfortable fit for all-day wear.",
    basePrice: 1800,
    colors: ["Navy Blue", "Jet Black", "Charcoal Gray", "Off White", "Dark Green"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Skinny Jeans",
    category: "Unisex",
    description: "Classic skinny fit jeans with stretch denim for comfort and style.",
    basePrice: 3200,
    colors: ["Dark Navy", "Jet Black", "Dark Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "High-Waisted Leggings",
    category: "Women",
    description: "High-waisted leggings with four-way stretch. Squat-proof and ultra comfortable.",
    basePrice: 2200,
    colors: ["Jet Black", "Dark Gray", "Navy Blue", "Deep Violet"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Bra",
    category: "Intimates",
    description: "Comfortable everyday bra with seamless design and supportive fit.",
    basePrice: 1800,
    colors: ["Baby Pink", "Jet Black", "Off White", "Beige"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Men's Jogger Pants",
    category: "Men",
    description: "Comfortable jogger pants with tapered leg and elastic cuffs. Great for casual and active wear.",
    basePrice: 2600,
    colors: ["Jet Black", "Charcoal Gray", "Navy Blue", "Dark Taupe"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Denim Shorts",
    category: "Unisex",
    description: "Classic denim shorts for warm weather. Relaxed fit with a vintage wash.",
    basePrice: 2000,
    colors: ["Dark Navy", "Sky Blue", "Jet Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Pleated Skirt",
    category: "Women",
    description: "Elegant pleated skirt with a flattering A-line silhouette. Versatile for any occasion.",
    basePrice: 2400,
    colors: ["Jet Black", "Navy Blue", "Beige", "Wine Rose"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Cargo Pants",
    category: "Men",
    description: "Utility cargo pants with multiple pockets. Durable fabric for everyday adventures.",
    basePrice: 3000,
    colors: ["Dark Taupe", "Jet Black", "Forest Green", "Charcoal Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Lightweight Bomber Jacket",
    category: "Outerwear",
    description: "Lightweight bomber jacket with ribbed collar and cuffs. Perfect transitional piece.",
    basePrice: 4500,
    colors: ["Jet Black", "Navy Blue", "Forest Green", "Dark Taupe"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Denim Jacket",
    category: "Outerwear",
    description: "Classic denim jacket with button front closure. A timeless layering piece.",
    basePrice: 4200,
    colors: ["Dark Navy", "Sky Blue", "Jet Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Waterproof Raincoat",
    category: "Outerwear",
    description: "Waterproof raincoat with sealed seams and adjustable hood. Stay dry in any weather.",
    basePrice: 5500,
    colors: ["Navy Blue", "Jet Black", "Forest Green", "Dark Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Wool Blend Overcoat",
    category: "Outerwear",
    description: "Premium wool blend overcoat with a tailored fit. Sophisticated warmth for winter.",
    basePrice: 8500,
    colors: ["Charcoal Gray", "Jet Black", "Dark Taupe", "Navy Blue"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Floral Summer Dress",
    category: "Women",
    description: "Light and breezy floral print dress. Perfect for summer days and outdoor events.",
    basePrice: 3200,
    colors: ["Rose Pink", "Lavender", "Mint Green", "Baby Pink"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Bodycon Mini Dress",
    category: "Women",
    description: "Figure-hugging bodycon mini dress for a night out. Sleek and modern design.",
    basePrice: 2800,
    colors: ["Jet Black", "True Red", "Navy Blue", "Deep Violet"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Casual Jumpsuit",
    category: "Women",
    description: "Effortless one-piece jumpsuit with a relaxed fit. Easy style for any casual occasion.",
    basePrice: 3500,
    colors: ["Jet Black", "Beige", "Navy Blue", "Dark Taupe"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Compression Gym Shirt",
    category: "Activewear",
    description: "Performance compression shirt with moisture-wicking technology. Engineered for intense workouts.",
    basePrice: 2000,
    colors: ["Jet Black", "Navy Blue", "Dark Gray", "True Red"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Yoga Set (Top + Leggings)",
    category: "Activewear",
    description: "Matching yoga set with sports top and high-waisted leggings. Four-way stretch fabric.",
    basePrice: 4000,
    colors: ["Jet Black", "Deep Violet", "Teal", "Rose Pink"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    name: "Graphic Sweatshirt",
    category: "Unisex",
    description: "Relaxed fit graphic sweatshirt in soft fleece-lined cotton. Bold streetwear vibes.",
    basePrice: 2800,
    colors: ["Off White", "Jet Black", "Charcoal Gray", "Navy Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Unisex Lounge Shorts",
    category: "Unisex",
    description: "Ultra-soft lounge shorts for maximum comfort at home or on the go.",
    basePrice: 1400,
    colors: ["Charcoal Gray", "Navy Blue", "Beige", "Jet Black"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Knitted Beanie",
    category: "Accessories",
    description: "Warm knitted beanie in a ribbed design. One size fits most.",
    basePrice: 800,
    colors: ["Jet Black", "Charcoal Gray", "Navy Blue", "Beige", "Dark Red"],
    sizes: ["M"],
  },
  {
    name: "Puffer Vest",
    category: "Outerwear",
    description: "Lightweight puffer vest with synthetic down fill. Extra warmth without the bulk.",
    basePrice: 3800,
    colors: ["Jet Black", "Navy Blue", "Forest Green", "Charcoal Gray"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Women's Lace Bralette",
    category: "Intimates",
    description: "Delicate lace bralette with soft lining. Beautiful and comfortable everyday wear.",
    basePrice: 1500,
    colors: ["Jet Black", "Off White", "Baby Pink", "Wine Rose"],
    sizes: ["XS", "S", "M", "L"],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const fileRef = bucket.file(storagePath);
  const buffer = fs.readFileSync(localPath);
  await fileRef.save(buffer, {
    metadata: { contentType: "image/png" },
  });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

function getProductImages(productName) {
  const dir = path.join(IMAGES_DIR, productName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("processed_"))
    .sort()
    .slice(0, 4); // max 4 images per product
}

// ─── MAIN SEED ───────────────────────────────────────────────
async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Create categories
  console.log("📁 Creating categories...");
  const categoryMap = {}; // name -> docId
  for (const cat of CATEGORIES) {
    // Check if exists
    const existing = await db
      .collection("categories")
      .where("name", "==", cat.name)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      categoryMap[cat.name] = doc.id;
      console.log(`   ✓ ${cat.name} (exists: ${doc.id})`);
    } else {
      const ref = await db.collection("categories").add({
        name: cat.name,
        imageUrl: "",
        productCount: 0,
        active: true,
      });
      categoryMap[cat.name] = ref.id;
      console.log(`   + ${cat.name} (${ref.id})`);
    }
  }

  // 2. Create sizes
  console.log("\n📐 Creating sizes...");
  const sizeMap = {}; // name -> docId
  for (const sizeName of SIZES) {
    const existing = await db
      .collection("sizes")
      .where("name", "==", sizeName)
      .get();
    if (!existing.empty) {
      sizeMap[sizeName] = existing.docs[0].id;
      console.log(`   ✓ ${sizeName} (exists: ${existing.docs[0].id})`);
    } else {
      const ref = await db.collection("sizes").add({ name: sizeName, active: true });
      sizeMap[sizeName] = ref.id;
      console.log(`   + ${sizeName} (${ref.id})`);
    }
  }

  // 3. Create colors (skip existing)
  console.log("\n🎨 Creating colors...");
  const colorMap = {}; // name -> { id, hexCode }
  const existingColors = await db.collection("colors").get();
  const existingColorNames = {};
  existingColors.forEach((doc) => {
    const d = doc.data();
    existingColorNames[d.name] = { id: doc.id, hexCode: d.hexCode };
  });

  for (const color of COLORS) {
    if (existingColorNames[color.name]) {
      colorMap[color.name] = existingColorNames[color.name];
      // skip log for existing to reduce noise
    } else {
      const ref = await db.collection("colors").add({
        name: color.name,
        hexCode: color.hexCode,
        active: true,
      });
      colorMap[color.name] = { id: ref.id, hexCode: color.hexCode };
      console.log(`   + ${color.name} ${color.hexCode}`);
    }
  }
  console.log(`   Total colors in system: ${Object.keys(colorMap).length}`);

  // 4. Create products with images
  console.log("\n📦 Creating products...");
  const productCountPerCategory = {};

  for (const prod of PRODUCTS) {
    // Check if product already exists
    const existing = await db
      .collection("products")
      .where("name", "==", prod.name)
      .get();
    if (!existing.empty) {
      console.log(`   ✓ ${prod.name} (already exists, skipping)`);
      continue;
    }

    const categoryId = categoryMap[prod.category];
    if (!categoryId) {
      console.log(`   ✗ ${prod.name} — category "${prod.category}" not found!`);
      continue;
    }

    // Upload images
    const imageFiles = getProductImages(prod.name);
    const imageUrls = [];
    for (const imgFile of imageFiles) {
      const localPath = path.join(IMAGES_DIR, prod.name, imgFile);
      const storagePath = `products/${prod.name.replace(/[^a-zA-Z0-9]/g, "_")}/${Date.now()}_${imgFile.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      try {
        const url = await uploadImage(localPath, storagePath);
        imageUrls.push(url);
        process.stdout.write(".");
      } catch (e) {
        console.error(`\n   ✗ Failed to upload ${imgFile}: ${e.message}`);
      }
    }

    // Build sizes array
    const sizes = prod.sizes.map((sizeName) => ({
      sizeId: sizeMap[sizeName],
      sizeName: sizeName,
      stockQuantity: 50,
      price: prod.basePrice,
    }));

    // Build colors array
    const colors = prod.colors
      .filter((cn) => colorMap[cn])
      .map((cn) => ({
        colorId: colorMap[cn].id,
        colorName: cn,
        hexCode: colorMap[cn].hexCode,
      }));

    // Total stock
    const totalStock = sizes.reduce((sum, s) => sum + s.stockQuantity, 0);

    const productData = {
      name: prod.name,
      description: prod.description,
      basePrice: prod.basePrice,
      category: categoryId,
      categoryId: categoryId,
      categoryName: prod.category,
      sizes: sizes,
      colors: colors,
      imageUrls: imageUrls,
      totalStock: totalStock,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("products").add(productData);
    console.log(`\n   + ${prod.name} (${ref.id}) — ${imageUrls.length} images, ${sizes.length} sizes, ${colors.length} colors`);

    // Track category product count
    productCountPerCategory[categoryId] =
      (productCountPerCategory[categoryId] || 0) + 1;
  }

  // 5. Update category product counts
  console.log("\n📊 Updating category product counts...");
  for (const [catId, count] of Object.entries(productCountPerCategory)) {
    // Get current count from existing products
    const allProducts = await db
      .collection("products")
      .where("categoryId", "==", catId)
      .where("active", "==", true)
      .get();
    await db
      .collection("categories")
      .doc(catId)
      .update({ productCount: allProducts.size });
    console.log(`   Updated category ${catId}: ${allProducts.size} products`);
  }

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
