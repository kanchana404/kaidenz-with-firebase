import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

const STATUS_LABELS: Record<string, string> = {
  PAID: "Order Placed & Paid",
  PROCESSING: "Processing",
  PACKED: "Packed",
  "ON-DELIVERY": "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: orderId } = await params;
    const upperStatus = status.toUpperCase();

    let orderData: FirebaseFirestore.DocumentData | undefined;
    let orderDocRef: FirebaseFirestore.DocumentReference | undefined;

    // Find the order document by orderId field
    const snapshot = await adminDb
      .collection("orders")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Try using orderId as document ID
      const docRef = adminDb.collection("orders").doc(orderId);
      const doc = await docRef.get();
      if (!doc.exists) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }
      await docRef.update({ status: upperStatus });
      orderData = doc.data();
      orderDocRef = docRef;
    } else {
      await snapshot.docs[0].ref.update({ status: upperStatus });
      orderData = snapshot.docs[0].data();
      orderDocRef = snapshot.docs[0].ref;
    }

    // Send push notification to the customer
    if (orderData?.userId) {
      try {
        const userDoc = await adminDb
          .collection("users")
          .doc(orderData.userId)
          .get();
        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (fcmToken) {
          const statusLabel =
            STATUS_LABELS[upperStatus] || upperStatus;
          const title =
            upperStatus === "DELIVERED"
              ? "Order Delivered!"
              : upperStatus === "CANCELLED"
              ? "Order Cancelled"
              : "Order Update - Kaidenz";
          const body =
            upperStatus === "DELIVERED"
              ? `Your order #${orderId} has been delivered. Enjoy your purchase!`
              : upperStatus === "CANCELLED"
              ? `Your order #${orderId} has been cancelled.`
              : `Your order #${orderId} is now: ${statusLabel}`;

          await adminMessaging.send({
            token: fcmToken,
            data: {
              title,
              body,
              orderId: orderId,
              status: upperStatus,
              type: "ORDER_STATUS_UPDATE",
            },
            android: {
              priority: "high",
              notification: {
                title,
                body,
                channelId: "kaidenz_orders",
                icon: "ic_notification",
                color: "#F5A623",
                sound: "default",
              },
            },
          });

          console.log(
            `✅ Notification sent to user ${orderData.userId} for order ${orderId}`
          );
        } else {
          console.log(
            `⚠️ No FCM token for user ${orderData.userId}, skipping notification`
          );
        }
      } catch (notifError) {
        // Don't fail the status update if notification fails
        console.error("Failed to send notification:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
