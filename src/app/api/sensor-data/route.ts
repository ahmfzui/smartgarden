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

export async function GET() {
  try {
    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    
    // Get latest sensor data - menggunakan koleksi yang sama dengan kode Anda
    const latestData = await db.collection("sensors")
      .find({})
      .sort({ timestamp: -1 })
      .limit(25)
      .toArray();
    
    return NextResponse.json(latestData);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid sensor data format" }, { status: 400 });
    }
    
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    
    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    
    // Insert sensor data
    await db.collection("sensors").insertOne(data);
    
    // Check soil moisture and update pump status if in automatic mode
    const settings = await db.collection("settings").findOne({ type: "pump" });
    let pumpStatus = data.pumpStatus;
    
    if (settings && settings.manual === false) {
      // Auto mode: If soil moisture is below threshold, turn on the pump
      // Otherwise, turn it off
      const thresholdValue = 1000; // Adjust this value based on your sensor
      const newPumpStatus = data.soilMoisture < thresholdValue ? 1 : 0;
      
      if (newPumpStatus !== settings.status) {
        await db.collection("settings").updateOne(
          { type: "pump" },
          { $set: { status: newPumpStatus, updatedAt: new Date() } }
        );
        pumpStatus = newPumpStatus;
      }
    }
    
    return NextResponse.json({ success: true, pumpStatus });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    return NextResponse.json({ 
      error: "Failed to save sensor data",
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}