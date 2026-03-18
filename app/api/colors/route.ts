import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("colors").get();

    const colors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const docRef = await adminDb.collection("colors").add({
      name: body.name,
      hexCode: body.hexCode || "",
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      name: body.name,
      hexCode: body.hexCode || "",
    });
  } catch (error) {
    console.error("Error adding color:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add color" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Color ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("colors").doc(body.id).update({
      name: body.name,
      hexCode: body.hexCode || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating color:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update color" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Color ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("colors").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting color:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete color" },
      { status: 500 }
    );
  }
}
