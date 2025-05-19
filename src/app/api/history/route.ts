import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

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
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    const data = await db
      .collection("sensorData") // Konsisten menggunakan "sensorData"
      .find({})
      .sort({ timestamp: -1 })
      .limit(100) // Batasan jumlah data untuk performa
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