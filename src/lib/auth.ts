// API key untuk ESP32
export const API_KEY = "smart-garden-2023";

// Fungsi untuk validasi API key
export function validateApiKey(reqKey: string | null): boolean {
  if (!reqKey) return false;
  return reqKey === API_KEY;
}

// Fungsi untuk validasi apakah request berasal dari browser dashboard atau ESP32
export function isLocalRequest(req: Request): boolean {
  // Checking if the request comes from our website
  const referer = req.headers.get('referer');
  if (referer && (
    referer.includes('smartgarden-nine.vercel.app') || 
    referer.includes('localhost')
  )) {
    return true;
  }
  
  return false;
}

// Header CORS untuk semua respons
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}