import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('token')?.value
	const { pathname } = request.nextUrl

	// Protected routes (autentifikatsiya talab qilinadigan sahifalar)
	const protectedRoutes = ['/dashboard', '/admin']

	// Agar protected route ga kirmoqchi bo'lsa va token yo'q bo'lsa
	if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// Agar login yoki register sahifasiga kirmoqchi bo'lsa va token mavjud bo'lsa
	if ((pathname === '/login' || pathname === '/register') && token) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	return NextResponse.next()
}

// Middleware qaysi path larda ishlashini ko'rsatish
export const config = {
	matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}
