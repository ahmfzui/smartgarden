import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("smartgarden");
  const latest = await db
    .collection("pumpControl")
    .findOne({}, { sort: { timestamp: -1 } });
  return NextResponse.json({
    pumpStatus: latest ? latest.pumpStatus : 0,
    manual: latest ? !!latest.manual : false,
  });
}

export async function POST(req: NextRequest) {
  const { pumpStatus, manual } = await req.json();
  if (typeof pumpStatus !== "number" || typeof manual !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db("smartgarden");
  await db.collection("pumpControl").insertOne({
    pumpStatus,
    manual,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}