import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("products").get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Look up category name from Firestore
    let categoryName = "";
    if (body.category) {
      const catDoc = await adminDb
        .collection("categories")
        .doc(body.category.toString())
        .get();
      if (catDoc.exists) {
        categoryName = catDoc.data()?.name || "";
      }
    }

    // Build sizes array with names from Firestore
    const sizes = await Promise.all(
      (body.sizes || []).map(async (size: { sizeId: string; stockQuantity: number; price: number }) => {
        let sizeName = "";
        const sizeDoc = await adminDb.collection("sizes").doc(size.sizeId.toString()).get();
        if (sizeDoc.exists) {
          sizeName = sizeDoc.data()?.name || "";
        }
        return {
          sizeId: size.sizeId.toString(),
          sizeName,
          stockQuantity: size.stockQuantity,
          price: size.price,
        };
      })
    );

    // Build colors array with names from Firestore
    const colors = await Promise.all(
      (body.colors || []).map(async (color: { colorId: string }) => {
        let colorName = "";
        let hexCode = "";
        const colorDoc = await adminDb.collection("colors").doc(color.colorId.toString()).get();
        if (colorDoc.exists) {
          colorName = colorDoc.data()?.name || "";
          hexCode = colorDoc.data()?.hexCode || "";
        }
        return {
          colorId: color.colorId.toString(),
          colorName,
          hexCode,
        };
      })
    );

    // Calculate total stock from sizes
    const totalStock = sizes.reduce((sum: number, s: { stockQuantity: number }) => sum + s.stockQuantity, 0);

    const productData = {
      name: body.name,
      description: body.description,
      basePrice: body.basePrice,
      totalStock,
      categoryId: body.category?.toString() || "",
      categoryName,
      imageUrls: body.imageUrls || [],
      sizes,
      colors,
      rating: 0,
      reviewCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("products").add(productData);

    return NextResponse.json({ success: true, id: docRef.id, ...productData });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("products")
      .doc(id)
      .update({
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("products").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
