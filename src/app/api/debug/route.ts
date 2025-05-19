import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// Interface untuk struktur dbInfo
interface DbInfo {
  connected: boolean;
  error: string | null;
  databases: string[];
  collections: Array<{ name: string; count: number }>;
}

export async function GET() {
  try {
    // Basic environment info
    const envInfo = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      mongodbUri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:***@') : 
        'Not defined'
    };

    // Attempt MongoDB connection
    let dbInfo: DbInfo = { 
      connected: false, 
      error: null, 
      databases: [], 
      collections: [] 
    };
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5000ms')), 5000)
      );
      
      const client: MongoClient = await Promise.race([
        clientPromise,
        timeoutPromise
      ]) as MongoClient;
      
      // Test connection by getting info
      const db = client.db("smartgarden");
      const collections = await db.listCollections().toArray();
      
      // Get collection counts
      const collectionCounts = await Promise.all(
        collections.map(async (coll) => {
          const count = await db.collection(coll.name).countDocuments();
          return { name: coll.name, count };
        })
      );
      
      dbInfo = {
        connected: true,
        error: null,
        databases: ["smartgarden"], // Just show the one we're using
        collections: collectionCounts
      };
    } catch (error) {
      dbInfo = {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        databases: [],
        collections: []
      };
    }

    return NextResponse.json({
      status: "ok",
      env: envInfo,
      db: dbInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}