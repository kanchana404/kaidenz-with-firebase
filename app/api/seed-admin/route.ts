import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    projectId: "kaidenz",
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

// POST /api/seed-admin — Creates admin user in both Auth and Firestore
// Run ONCE, then delete this file
export async function POST() {
  const email = "admin@gmail.com";
  const password = "123#Admin1";

  try {
    let uid: string;

    // Check if user already exists in Auth
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
      console.log("Admin user already exists in Auth:", uid);
    } catch {
      // User doesn't exist, create in Auth
      const newUser = await adminAuth.createUser({
        email,
        password,
        displayName: "Admin Kaidenz",
      });
      uid = newUser.uid;
      console.log("Created admin user in Auth:", uid);
    }

    // Create/update user document in Firestore
    await adminDb.collection("users").doc(uid).set(
      {
        userId: uid,
        firstName: "Admin",
        lastName: "Kaidenz",
        email,
        phone: "",
        profilePicUrl: "",
        role: "admin",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("Admin user document created in Firestore");

    return NextResponse.json({
      success: true,
      message: "Admin user seeded in both Auth and Firestore",
      uid,
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
