import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { validateApiKey } from "@/lib/apikey";

// Define sensor data type
interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp?: Date;
}

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
    
    const latestData = await db.collection("sensorData")
      .find({})
      .sort({ timestamp: -1 })
      .limit(25)
      .toArray();
    
    return NextResponse.json(latestData, { headers: allowAllHeaders() });
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500, headers: allowAllHeaders() });
  }
}

export async function POST(request: NextRequest) {
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
    const data: SensorData = await request.json();
    
    // Validate required fields
    if (
      typeof data.temperature !== 'number' ||
      typeof data.humidity !== 'number' ||
      typeof data.soilMoisture !== 'number' ||
      typeof data.pumpStatus !== 'number'
    ) {
      return NextResponse.json(
        { error: "Invalid sensor data format" }, 
        { status: 400, headers: allowAllHeaders() }
      );
    }
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    
    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    
    // Insert sensor data - gunakan sensorData untuk semua koleksi
    await db.collection("sensorData").insertOne(data);
    
    // Dapatkan status pompa terbaru
    const latestPump = await db.collection("pumpControl").findOne({}, 
      { sort: { timestamp: -1 } });
    
    // Default values
    let pumpStatus = data.pumpStatus;
    let manual = latestPump ? !!latestPump.manual : false;
    
    return NextResponse.json({ 
      success: true, 
      pumpStatus, 
      manual
    }, { headers: allowAllHeaders() });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to save sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500, headers: allowAllHeaders() });
  }
}