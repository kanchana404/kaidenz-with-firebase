import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "user")
      .get();

    const customers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.userId || doc.id,
        first_name: data.firstName || "",
        last_name: data.lastName || "",
        email: data.email || "",
        verification_code: data.verified ? "verified" : "unverified",
        address: data.address
          ? {
              line1: data.address.line1 || "",
              line2: data.address.line2 || "",
              postal_code: data.address.postalCode || "",
              phone: data.address.phone || "",
              city: {
                name: data.address.cityName || "",
              },
              province: {
                name: data.address.provinceName || "",
              },
            }
          : undefined,
      };
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
