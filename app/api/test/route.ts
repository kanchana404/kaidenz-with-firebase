import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Test Firestore connectivity
    const snapshot = await adminDb.collection("users").limit(1).get();

    return NextResponse.json({
      success: true,
      message: "Firestore is connected",
      documentCount: snapshot.size,
    });
  } catch (error) {
    console.error("Firestore connectivity test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cannot connect to Firestore",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
