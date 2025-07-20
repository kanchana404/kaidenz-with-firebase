import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("API: Fetching categories from backend...")
    const response = await fetch("http://localhost:8080/kaidenz/GetCategory", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API: Backend response status:", response.status)

    if (response.ok) {
      const result = await response.json();
      console.log("API: Backend categories response:", result);
      
      // The Java backend now returns objects with IDs
      const categoriesWithIds = result.map((category: { id: number; name: string }) => ({
        id: category.id.toString(),
        name: category.name
      }));
      
      return NextResponse.json({
        success: true,
        categories: categoriesWithIds
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
    console.error("API: Error fetching categories:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const categoryName = formData.get("name") as string;
    const action = formData.get("action") as string;
    
    // Handle delete action
    if (action === "delete") {
      const categoryId = formData.get("id") as string;
      const categoryName = formData.get("name") as string; // Get name from frontend
      console.log("API: Deleting category via POST:", { id: categoryId, name: categoryName });
      
      if (!categoryId || categoryId.trim() === "") {
        return NextResponse.json({ 
          success: false, 
          error: "Category ID is required" 
        }, { status: 400 });
      }
      
      // Send delete data to Java backend
      const backendFormData = new FormData();
      backendFormData.append("id", categoryId.trim());
      backendFormData.append("action", "delete");
      backendFormData.append("name", "DELETE_OPERATION"); // Send special value to bypass validation
      backendFormData.append("method", "DELETE"); // Add method parameter as backup
      backendFormData.append("delete", "true"); // Explicit delete flag
      
      // Try GET request with query parameters for delete operation
      const deleteUrl = `http://localhost:8080/kaidenz/GetCategory?id=${categoryId.trim()}&action=delete&name=${encodeURIComponent(categoryName || "")}`;
      
      const response = await fetch(deleteUrl, {
        method: "GET",
      });

      console.log("API: Backend response status:", response.status);
      console.log("API: DELETE request parameters:", {
        id: categoryId,
        action: "delete",
        name: categoryName,
        url: deleteUrl
      });

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
    }
    
    // Handle add action (default)
    console.log("API: Adding category:", categoryName);
    
    if (!categoryName || categoryName.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Category name is required" 
      }, { status: 400 });
    }
    
    // Send data to Java backend using query parameters
    const addUrl = `http://localhost:8080/kaidenz/GetCategory?name=${encodeURIComponent(categoryName.trim())}`;
    
    const response = await fetch(addUrl, {
      method: "POST",
    });

    console.log("API: Backend response status:", response.status);
    console.log("API: ADD request URL:", addUrl);

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
    console.error("API: Error in POST operation:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to process request: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const categoryId = formData.get("id") as string;
    const categoryName = formData.get("name") as string;
    
    console.log("API: Updating category:", { id: categoryId, name: categoryName });
    
    if (!categoryId || categoryId.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Category ID is required" 
      }, { status: 400 });
    }
    
    if (!categoryName || categoryName.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Category name is required" 
      }, { status: 400 });
    }
    
    // Send data to Java backend using query parameters
    const updateUrl = `http://localhost:8080/kaidenz/GetCategory?id=${categoryId.trim()}&name=${encodeURIComponent(categoryName.trim())}`;
    
    const response = await fetch(updateUrl, {
      method: "PUT",
    });

    console.log("API: Backend response status:", response.status);
    console.log("API: UPDATE request URL:", updateUrl);

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
    console.error("API: Error updating category:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const formData = await req.formData();
    const categoryId = formData.get("id") as string;
    
    console.log("API: Deleting category:", categoryId);
    
    if (!categoryId || categoryId.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Category ID is required" 
      }, { status: 400 });
    }
    
    // Create a new request with action=delete and forward to POST
    const deleteFormData = new FormData();
    deleteFormData.append("id", categoryId.trim());
    deleteFormData.append("action", "delete");
    deleteFormData.append("name", formData.get("name") as string || ""); // Pass the name from frontend
    
    // Create a new request object
    const deleteRequest = new NextRequest(req.url, {
      method: "POST",
      body: deleteFormData,
    });
    
    // Forward to POST method
    return await POST(deleteRequest);
  } catch (error) {
    console.error("API: Error deleting category:", error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}` 
    }, { status: 500 });
  }
} 