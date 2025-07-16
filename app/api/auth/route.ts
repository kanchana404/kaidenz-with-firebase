import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  // Use `auth()` to get the user's ID
  const { userId } = await auth();

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch user from Clerk backend API
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!clerkRes.ok) {
    return new NextResponse("Failed to fetch user", { status: 500 });
  }

  const user = await clerkRes.json();
  const privateMetadata = user.private_metadata;

  // Check if user is admin
  if (privateMetadata?.role === "admin") {
    // Return admin panel data or success
    return NextResponse.json({ admin: true, privateMetadata }, { status: 200 });
  } else {
    // Not admin: return unauthorized
    return new NextResponse("Unauthorized: Not an admin", { status: 403 });
    // Or: return NextResponse.redirect("/unauthorized");
  }
}
