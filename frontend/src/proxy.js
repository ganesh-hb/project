import { NextResponse } from 'next/server'

export function proxy(request) {
    let hasAccessToken = request.cookies.get('accessToken')?.value;

    if (!hasAccessToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()

}

export const config = {
    matcher: ['/contact', '/', '/users', '/user:path*', '/', '/reset-pass', '/add-company', '/company-list', '/group-list', '/capabilities', '/capability:path*', '/forbidden', '/profile', '/currency-list', '/currency:path*'],
}

