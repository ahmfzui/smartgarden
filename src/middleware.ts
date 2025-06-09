import { NextRequest, NextResponse } from 'next/server';

// Define auth routes and paths that should be public
const publicPaths = ['/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register', '/api/auth/verify'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is API path for ESP32 (needs to bypass auth)
  if (pathname.startsWith('/api/sensor') || pathname.startsWith('/api/pump')) {
    // ESP32 requests should have API_KEY in headers or query params
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('key');
    
    if (apiKey === process.env.API_KEY) {
      return NextResponse.next();
    }
    
    // If no valid API key and it's not from the dashboard, reject
    const referer = request.headers.get('referer');
    if (!referer || (!referer.includes('smartgarden-nine.vercel.app') && !referer.includes('localhost'))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // Always allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check for auth token in cookies
  const token = request.cookies.get('smart-garden-auth')?.value;
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // For authenticated users, allow access
  return NextResponse.next();
}

// Configure which paths middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|).*)',
  ],
};