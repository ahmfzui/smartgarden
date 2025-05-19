import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { validateApiKey, API_KEY } from "@/lib/apikey";

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
    const latest = await db
      .collection("pumpControl")
      .findOne({}, { sort: { timestamp: -1 } });
    
    return NextResponse.json({
      pumpStatus: latest ? latest.pumpStatus : 0,
      manual: latest ? !!latest.manual : false,
    }, { headers: allowAllHeaders() });
  } catch (error) {
    console.error("Error fetching pump status:", error);
    return NextResponse.json(
      { error: "Failed to fetch pump status", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: allowAllHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  // Extract API key dari query parameter
  const apiKey = req.nextUrl.searchParams.get('key');
  
  // Validasi API key
  if (!validateApiKey(apiKey)) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401, headers: allowAllHeaders() }
    );
  }
  
  try {
    const { pumpStatus, manual } = await req.json();
    if (typeof pumpStatus !== "number" || typeof manual !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload" }, 
        { status: 400, headers: allowAllHeaders() }
      );
    }
    
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    await db.collection("pumpControl").insertOne({
      pumpStatus,
      manual,
      timestamp: new Date(),
    });
    
    return NextResponse.json(
      { success: true }, 
      { headers: allowAllHeaders() }
    );
  } catch (error) {
    console.error("Error updating pump status:", error);
    return NextResponse.json(
      { error: "Failed to update pump status", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: allowAllHeaders() }
    );
  }
}