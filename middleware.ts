import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

export async function middleware(request: NextRequest) {
    const session = await getSession();

    // Protect the dashboard and any API route except auth
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/'))) {

        if (!session) {
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect auth pages to dashboard if already logged in
    if (['/login', '/register'].includes(request.nextUrl.pathname)) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/api/:path*'],
};
