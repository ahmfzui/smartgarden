import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("smartgarden");
    const usersCollection = db.collection("users");
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });
    
    // Return success
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}