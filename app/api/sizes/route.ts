import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("sizes").get();

    const sizes = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));

    return NextResponse.json({ success: true, sizes });
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeName = formData.get("name") as string;

    if (!sizeName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Size name is required" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("sizes").add({
      name: sizeName.trim(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      name: sizeName.trim(),
    });
  } catch (error) {
    console.error("Error adding size:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add size" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeId = formData.get("id") as string;
    const sizeName = formData.get("name") as string;

    if (!sizeId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Size ID is required" },
        { status: 400 }
      );
    }
    if (!sizeName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Size name is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("sizes")
      .doc(sizeId.trim())
      .update({ name: sizeName.trim() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating size:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update size" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeId = formData.get("id") as string;

    if (!sizeId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Size ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("sizes").doc(sizeId.trim()).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting size:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete size" },
      { status: 500 }
    );
  }
}
