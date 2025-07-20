import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("API: Fetching sizes from backend...")
    const response = await fetch("http://localhost:8080/kaidenz/GetSizes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API: Backend response status:", response.status)

    if (response.ok) {
      const result = await response.json();
      console.log("API: Backend sizes response:", result);
      
      // The Java backend now returns objects with IDs
      const sizesWithIds = result.map((size: { id: number; name: string }) => ({
        id: size.id.toString(),
        name: size.name
      }));
      
      return NextResponse.json({
        success: true,
        sizes: sizesWithIds
      });
    } else {
      const errorText = await response.text();
      console.error("API: Backend error response:", errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Backend error: ${response.status} - ${errorText}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API: Error fetching sizes:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch sizes: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeName = formData.get("name") as string;
    
    console.log("API: Adding size:", sizeName);
    
    if (!sizeName || sizeName.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Size name is required" 
      }, { status: 400 });
    }
    
    // Send data to Java backend using query parameters
    const addUrl = `http://localhost:8080/kaidenz/GetSizes?name=${encodeURIComponent(sizeName.trim())}`;
    
    const response = await fetch(addUrl, {
      method: "POST",
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
    console.error("API: Error adding size:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to add size: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeId = formData.get("id") as string;
    const sizeName = formData.get("name") as string;
    
    console.log("API: Updating size:", { id: sizeId, name: sizeName });
    
    if (!sizeId || sizeId.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Size ID is required" 
      }, { status: 400 });
    }
    
    if (!sizeName || sizeName.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Size name is required" 
      }, { status: 400 });
    }
    
    // Send data to Java backend using query parameters
    const updateUrl = `http://localhost:8080/kaidenz/GetSizes?id=${sizeId.trim()}&name=${encodeURIComponent(sizeName.trim())}`;
    
    const response = await fetch(updateUrl, {
      method: "PUT",
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
    console.error("API: Error updating size:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update size: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sizeId = formData.get("id") as string;
    
    console.log("API: Deleting size:", sizeId);
    
    if (!sizeId || sizeId.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Size ID is required" 
      }, { status: 400 });
    }
    
    // Send data to Java backend
    const backendFormData = new FormData();
    backendFormData.append("id", sizeId.trim());
    
    const response = await fetch("http://localhost:8080/kaidenz/GetSizes", {
      method: "DELETE",
      body: backendFormData,
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
    console.error("API: Error deleting size:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete size: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
} 