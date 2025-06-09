import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
    
    // Delete the auth cookie
    response.cookies.set({
      name: 'smart-garden-auth',
      value: '',
      expires: new Date(0), // Force expiration
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}