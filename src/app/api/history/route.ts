import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    const data = await db
      .collection("sensorData")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}