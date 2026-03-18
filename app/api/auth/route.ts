import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

const adminAuth = getAuth();

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check Firestore for admin role
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (userDoc.exists && userDoc.data()?.role === "admin") {
      return NextResponse.json({ admin: true }, { status: 200 });
    } else {
      return NextResponse.json({ admin: false }, { status: 403 });
    }
  } catch (error) {
    console.error("Auth verification error:", error);
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
