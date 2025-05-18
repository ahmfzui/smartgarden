import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { temperature, humidity, soilMoisture, pumpStatus } = await req.json();
  if (
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    typeof soilMoisture !== "number" ||
    typeof pumpStatus !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db("smartgarden");
  await db.collection("sensorData").insertOne({
    temperature,
    humidity,
    soilMoisture,
    pumpStatus,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}