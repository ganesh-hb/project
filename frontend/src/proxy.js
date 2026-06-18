import { NextResponse } from 'next/server'

export function proxy(request) {
    let ifSession = (request.cookies.get('session')?.value);
    let ifLoggedIn = (request.cookies.get('loggedIn')?.value);

    if (!ifSession || !ifLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()

}

export const config = {
    matcher: ['/contact', '/', '/users', '/user:path*', '/', '/reset-pass'],

}

