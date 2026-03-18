import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("orders")
      .orderBy("orderTimestamp", "desc")
      .get();

    const orders = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        docId: doc.id,
        orderId: data.orderId || doc.id,
        customer: data.customer || "",
        total: data.total || 0,
        status: data.status || "PAID",
        date: data.date || "",
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
