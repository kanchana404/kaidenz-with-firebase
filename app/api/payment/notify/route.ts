import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

const MERCHANT_ID = "1224479";
const MERCHANT_SECRET = "MzUzNDM4Njg2MTM2MDQwMTI1NTE3Mzc3NDIyMzUxMzI5MDg5MDM1";

/**
 * PayHere Payment Notification Endpoint
 *
 * PayHere sends a POST with these fields:
 * merchant_id, order_id, payment_id, captured_amount, payhere_amount,
 * payhere_currency, status_code, md5sig, method, card_holder_name, etc.
 *
 * status_code: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargeback
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const merchantId = formData.get("merchant_id") as string;
    const orderId = formData.get("order_id") as string;
    const paymentId = formData.get("payment_id") as string;
    const capturedAmount = formData.get("captured_amount") as string;
    const payhereAmount = formData.get("payhere_amount") as string;
    const payhereCurrency = formData.get("payhere_currency") as string;
    const statusCode = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;
    const method = formData.get("method") as string;
    const statusMessage = formData.get("status_message") as string;

    console.log(`[PayHere Notify] order_id=${orderId}, payment_id=${paymentId}, status_code=${statusCode}, amount=${payhereAmount} ${payhereCurrency}`);

    // Verify MD5 signature
    const localMd5 = crypto
      .createHash("md5")
      .update(
        merchantId +
          orderId +
          payhereAmount +
          payhereCurrency +
          statusCode +
          crypto
            .createHash("md5")
            .update(MERCHANT_SECRET)
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    if (localMd5 !== md5sig) {
      console.error(`[PayHere Notify] MD5 signature mismatch! Expected: ${localMd5}, Got: ${md5sig}`);
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
    }

    // Verify merchant ID
    if (merchantId !== MERCHANT_ID) {
      console.error(`[PayHere Notify] Invalid merchant ID: ${merchantId}`);
      return NextResponse.json({ success: false, error: "Invalid merchant" }, { status: 403 });
    }

    // Find the order in Firestore by orderId field
    const snapshot = await adminDb
      .collection("orders")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();

    let orderDocRef;
    if (!snapshot.empty) {
      orderDocRef = snapshot.docs[0].ref;
    } else {
      // Try document ID
      const docRef = adminDb.collection("orders").doc(orderId);
      const doc = await docRef.get();
      if (doc.exists) {
        orderDocRef = docRef;
      }
    }

    // Determine status based on status_code
    let orderStatus: string;
    switch (statusCode) {
      case "2":
        orderStatus = "PAID";
        break;
      case "0":
        orderStatus = "PENDING";
        break;
      case "-1":
        orderStatus = "CANCELLED";
        break;
      case "-2":
        orderStatus = "FAILED";
        break;
      case "-3":
        orderStatus = "CHARGEBACK";
        break;
      default:
        orderStatus = "UNKNOWN";
    }

    if (orderDocRef) {
      // Update existing order with payment info
      await orderDocRef.update({
        status: orderStatus,
        paymentId: paymentId,
        paymentMethod: method || "",
        paymentAmount: parseFloat(payhereAmount) || 0,
        paymentCurrency: payhereCurrency || "LKR",
        paymentStatusMessage: statusMessage || "",
        paymentUpdatedAt: Date.now(),
      });
      console.log(`[PayHere Notify] Order ${orderId} updated to status: ${orderStatus}`);
    } else {
      // Order not found - create a payment record for reconciliation
      console.warn(`[PayHere Notify] Order ${orderId} not found in Firestore, saving payment record`);
      await adminDb.collection("payment_notifications").add({
        orderId,
        paymentId,
        merchantId,
        amount: parseFloat(payhereAmount) || 0,
        currency: payhereCurrency,
        statusCode: parseInt(statusCode),
        status: orderStatus,
        method: method || "",
        statusMessage: statusMessage || "",
        md5sig,
        receivedAt: Date.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PayHere Notify] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "PayHere Payment Notification" });
}
