import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// Define sensor data type
interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp?: Date;
}

// CORS Headers function
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    
    // Get latest sensor data - KONSISTENSI: gunakan "sensorData" untuk semua
    const latestData = await db.collection("sensorData")
      .find({})
      .sort({ timestamp: -1 })
      .limit(25)
      .toArray();
    
    return NextResponse.json(latestData, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: SensorData = await request.json();
    
    // Validate required fields
    if (
      typeof data.temperature !== 'number' ||
      typeof data.humidity !== 'number' ||
      typeof data.soilMoisture !== 'number' ||
      typeof data.pumpStatus !== 'number'
    ) {
      return NextResponse.json({ error: "Invalid sensor data format" }, 
        { status: 400, headers: corsHeaders() });
    }
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    
    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    
    // Insert sensor data - DIUBAH: gunakan koleksi "sensorData" konsisten
    await db.collection("sensorData").insertOne(data);
    
    // Dapatkan status pompa terbaru dari pumpControl
    const latestPump = await db.collection("pumpControl").findOne({}, 
      { sort: { timestamp: -1 } });
    
    // Default pumpStatus dan mode
    let pumpStatus = data.pumpStatus;
    let manual = latestPump ? !!latestPump.manual : false;
    
    // Jika mode otomatis, kontrol pompa berdasarkan sensor
    if (latestPump && !manual) {
      // Auto mode: If soil moisture is above threshold (dry), turn on the pump
      // Otherwise, turn it off
      const thresholdValue = 1500; // Adjust based on your sensor values
      const newPumpStatus = data.soilMoisture > 2000 ? 1 : 0;
      
      if (newPumpStatus !== latestPump.pumpStatus) {
        // Update ke pumpControl collection jika status berubah
        await db.collection("pumpControl").insertOne({
          pumpStatus: newPumpStatus,
          manual: false,
          timestamp: new Date()
        });
        pumpStatus = newPumpStatus;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      pumpStatus, 
      manual
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to save sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500, headers: corsHeaders() });
  }
}