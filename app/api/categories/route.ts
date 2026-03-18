import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("categories").get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      imageUrl: doc.data().imageUrl || "",
    }));

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get("action") as string;

    // Handle delete action via POST
    if (action === "delete") {
      const categoryId = formData.get("id") as string;
      if (!categoryId) {
        return NextResponse.json(
          { success: false, error: "Category ID is required" },
          { status: 400 }
        );
      }
      await adminDb.collection("categories").doc(categoryId).delete();
      return NextResponse.json({ success: true });
    }

    // Handle add
    const categoryName = formData.get("name") as string;
    const imageUrl = formData.get("imageUrl") as string || "";
    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("categories").add({
      name: categoryName.trim(),
      imageUrl,
      productCount: 0,
      active: true,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      name: categoryName.trim(),
      imageUrl,
    });
  } catch (error) {
    console.error("Error in category POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const categoryId = formData.get("id") as string;
    const categoryName = formData.get("name") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!categoryId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }
    if (!categoryName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = { name: categoryName.trim() };
    if (imageUrl !== null) {
      updateData.imageUrl = imageUrl;
    }

    await adminDb
      .collection("categories")
      .doc(categoryId.trim())
      .update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const formData = await req.formData();
    const categoryId = formData.get("id") as string;

    if (!categoryId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("categories").doc(categoryId.trim()).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
