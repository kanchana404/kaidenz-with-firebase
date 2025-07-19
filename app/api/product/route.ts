
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("API: Fetching products from backend...")
    const response = await fetch("http://localhost:8080/kaidenz/AddProduct", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API: Backend response status:", response.status)

    if (response.ok) {
      const result = await response.json();
      console.log("API: Backend response:", result);
      return NextResponse.json(result);
    } else {
      const errorText = await response.text();
      console.error("API: Backend error response:", errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Backend error: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API: Error fetching products:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Adding product:", body);
    
    // Send data to Java backend
    const response = await fetch("http://localhost:8080/kaidenz/AddProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("API: Backend response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("API: Backend response:", result);
      return NextResponse.json(result);
    } else {
      const errorText = await response.text();
      console.error("API: Backend error response:", errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Backend error: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API: Error adding product:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to add product: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("API: Updating product:", body);
    
    // Send data to Java backend
    const response = await fetch("http://localhost:8080/kaidenz/AddProduct", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("API: Backend response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("API: Backend response:", result);
      return NextResponse.json(result);
    } else {
      const errorText = await response.text();
      console.error("API: Backend error response:", errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Backend error: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API: Error updating product:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}
