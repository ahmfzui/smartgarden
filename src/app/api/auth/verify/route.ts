import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// This should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "smart-garden-secret-key-change-in-production";

// Define proper type for body
interface RequestBody {
  token?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Safely parse JSON, handle empty body
    let body: RequestBody = {};
    let bodyToken: string | undefined = undefined;
    
    try {
      body = await req.json() as RequestBody;
      bodyToken = body.token;
    } catch (parseError) {
      // If JSON parsing fails, just continue with empty body
      console.log("Empty or invalid JSON body in verify endpoint");
    }
    
    // Check for token in cookies first
    const cookieToken = req.cookies.get('smart-garden-auth')?.value;
    
    // Choose which token to verify (cookie token takes precedence)
    const token = cookieToken || bodyToken;
    
    if (!token) {
      return NextResponse.json(
        { message: "No authentication token provided" },
        { status: 401 }
      );
    }
    
    try {
      // Verify the token
      const decoded = verify(token, JWT_SECRET);
      
      // If token was provided in body but not in cookie, set cookie
      if (bodyToken && !cookieToken) {
        const response = NextResponse.json(
          { valid: true, user: decoded },
          { status: 200 }
        );
        
        response.cookies.set({
          name: 'smart-garden-auth',
          value: bodyToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/'
        });
        
        return response;
      }
      
      // Otherwise just return success
      return NextResponse.json(
        { valid: true, user: decoded },
        { status: 200 }
      );
      
    } catch (error) {
      // If token is invalid, clear the cookie
      if (cookieToken) {
        const response = NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 401 }
        );
        
        response.cookies.set({
          name: 'smart-garden-auth',
          value: '',
          expires: new Date(0),
          path: '/'
        });
        
        return response;
      }
      
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "An error occurred during token verification" },
      { status: 500 }
    );
  }
}