import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("orders")
      .orderBy("orderTimestamp", "desc")
      .get();

    // Group orders by customer name (since orders have a "customer" field)
    const customerMap: Record<
      string,
      {
        name: string;
        totalOrders: number;
        totalSpent: number;
        lastOrderDate: string;
        statuses: Record<string, number>;
        orderIds: string[];
      }
    > = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const customerName = data.customer || "Unknown";
      const total = data.total || 0;
      const status = data.status || "unknown";
      const date = data.date || "";
      const orderId = data.orderId || doc.id;

      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          name: customerName,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: date,
          statuses: {},
          orderIds: [],
        };
      }

      customerMap[customerName].totalOrders += 1;
      customerMap[customerName].totalSpent += total;
      customerMap[customerName].orderIds.push(orderId);

      // Track status counts
      if (!customerMap[customerName].statuses[status]) {
        customerMap[customerName].statuses[status] = 0;
      }
      customerMap[customerName].statuses[status] += 1;

      // Keep the most recent order date
      if (date > customerMap[customerName].lastOrderDate) {
        customerMap[customerName].lastOrderDate = date;
      }
    });

    const customers = Object.values(customerMap).map((customer, index) => ({
      id: index + 1,
      name: customer.name,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrderDate: customer.lastOrderDate,
      deliveredOrders: customer.statuses["delivered"] || 0,
      paidOrders: customer.statuses["paid"] || 0,
      cancelledOrders: customer.statuses["cancelled"] || 0,
    }));

    // Sort by total spent descending
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching order customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers from orders" },
      { status: 500 }
    );
  }
}
