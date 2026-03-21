const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize firebase-admin
const serviceAccountPath = path.join(__dirname, "service-account.json");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    projectId: "kaidenz",
    storageBucket: "kaidenz.firebasestorage.app",
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket("kaidenz.firebasestorage.app");

// Image to category mapping
const IMAGE_DIR = "/Users/kavitha/Public/Development/Android";
const categoryImageMap = {
  "Men": "Gemini_Generated_Image_2arf5b2arf5b2arf.png",
  "Women": "Gemini_Generated_Image_nc7kycnc7kycnc7k.png",
  "Unisex": "Gemini_Generated_Image_z1p7gcz1p7gcz1p7.png",
  "Activewear": "Gemini_Generated_Image_pvjzl5pvjzl5pvjz.png",
  "Outerwear": "Gemini_Generated_Image_fjwcf1fjwcf1fjwc.png",
  "Accessories": "Gemini_Generated_Image_xp78utxp78utxp78.png",
  "Intimates": "Gemini_Generated_Image_kjqv3ukjqv3ukjqv.png",
};

async function uploadImageAndGetUrl(localPath, storagePath) {
  const fileRef = bucket.file(storagePath);
  await fileRef.save(fs.readFileSync(localPath), {
    metadata: { contentType: "image/png" },
  });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

async function seedCategoryImages() {
  console.log("Fetching categories from Firestore...");
  const snapshot = await db.collection("categories").get();

  const categories = {};
  snapshot.docs.forEach((doc) => {
    categories[doc.data().name] = doc.id;
  });

  console.log("Found categories:", Object.keys(categories));

  for (const [categoryName, imageFile] of Object.entries(categoryImageMap)) {
    const docId = categories[categoryName];
    if (!docId) {
      console.log(`⚠ Category "${categoryName}" not found in DB, skipping.`);
      continue;
    }

    const localPath = path.join(IMAGE_DIR, imageFile);
    if (!fs.existsSync(localPath)) {
      console.log(`⚠ Image file not found: ${localPath}, skipping.`);
      continue;
    }

    const storagePath = `categories/${categoryName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
    console.log(`Uploading ${categoryName} image...`);

    const imageUrl = await uploadImageAndGetUrl(localPath, storagePath);
    console.log(`  → Uploaded: ${imageUrl}`);

    await db.collection("categories").doc(docId).update({ imageUrl });
    console.log(`  → Updated category "${categoryName}" (${docId}) with imageUrl`);
  }

  console.log("\nDone! All category images seeded.");
  process.exit(0);
}

seedCategoryImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
