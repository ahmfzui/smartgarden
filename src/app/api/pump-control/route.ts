import { NextRequest, NextResponse } from "next/server";
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
    const latest = await db
      .collection("pumpControl")
      .findOne({}, { sort: { timestamp: -1 } });
    return NextResponse.json({
      pumpStatus: latest ? latest.pumpStatus : 0,
      manual: latest ? !!latest.manual : false,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching pump status:", error);
    return NextResponse.json(
      { error: "Failed to fetch pump status", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pumpStatus, manual } = await req.json();
    if (typeof pumpStatus !== "number" || typeof manual !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: corsHeaders() });
    }
    const client: MongoClient = await clientPromise;
    const db = client.db("smartgarden");
    await db.collection("pumpControl").insertOne({
      pumpStatus,
      manual,
      timestamp: new Date(),
    });
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error updating pump status:", error);
    return NextResponse.json(
      { error: "Failed to update pump status", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}