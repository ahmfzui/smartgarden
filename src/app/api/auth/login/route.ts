import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

// This should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "smart-garden-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("smartgarden");
    const usersCollection = db.collection("users");
    
    // Find user
    const user = await usersCollection.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Verify password
    const passwordValid = await compare(password, user.password);
    
    if (!passwordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || "user"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Create response
    const response = NextResponse.json(
      { 
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role || "user"
        }
      },
      { status: 200 }
    );
    
    // Set HTTP-only cookie in the response
    response.cookies.set({
      name: 'smart-garden-auth',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}