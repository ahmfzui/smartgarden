// API key sederhana untuk validasi
export const API_KEY = "smart-garden-2023";

// Fungsi untuk validasi API key
export function validateApiKey(reqKey: string | null): boolean {
  if (!reqKey) return false;
  return reqKey === API_KEY;
}