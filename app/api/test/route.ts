import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing backend connectivity...");
    
    const response = await fetch("http://localhost:8080/kaidenz/AddProduct", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Backend test response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({ 
        success: true, 
        message: "Backend is running and accessible",
        status: response.status,
        data: result
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        message: "Backend responded with error",
        status: response.status,
        error: errorText
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Backend connectivity test failed:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Cannot connect to backend",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 