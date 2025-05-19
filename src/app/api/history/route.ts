import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { validateApiKey } from "@/lib/apikey";

// Gunakan header yang lebih simpel
function allowAllHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*'
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: allowAllHeaders() });
}

export async function GET(request: NextRequest) {
  // Extract API key dari query parameter
  const apiKey = request.nextUrl.searchParams.get('key');
  
  // Validasi API key
  if (!validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401, headers: allowAllHeaders() }
    );
  }
  
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    const data = await db
      .collection("sensorData")
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    return NextResponse.json(data, { headers: allowAllHeaders() });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: allowAllHeaders() }
    );
  }
}