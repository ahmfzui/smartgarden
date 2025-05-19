import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("smartgarden");
  const data = await db
    .collection("sensorData")
    .find({})
    .sort({ timestamp: -1 })
    .toArray();
  return NextResponse.json(data);
}