import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { validateApiKey, corsHeaders, isLocalRequest } from "@/lib/auth";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  // Verifikasi autentikasi berdasarkan sumbernya
  const apiKey = request.nextUrl.searchParams.get('key');
  const isLocal = isLocalRequest(request);
  
  // Jika bukan request lokal dan tidak memiliki API key yang valid
  if (!isLocal && !validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401, headers: corsHeaders() }
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
    
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}