import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/auth/callback',
	'/auth/v1/verify',
];

const PROTECTED_PATHS = ['/generate', '/flashcards', '/profile'];

export async function middleware(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const type = requestUrl.searchParams.get('type');
	const token = requestUrl.searchParams.get('token');
	const code = requestUrl.searchParams.get('code');
	const pathname = requestUrl.pathname;

	console.log(
		'\n🔍 ================== MIDDLEWARE DEBUG ==================',
	);
	console.log('📍 URL:', request.url);
	console.log('📍 Pathname:', pathname);
	console.log(
		'📍 Search Params:',
		Object.fromEntries(requestUrl.searchParams),
	);
	console.log('📍 Type:', type);
	console.log('📍 Token:', token ? '✅ Present' : '❌ Not present');
	console.log('📍 Code:', code ? '✅ Present' : '❌ Not present');
	console.log(
		'=====================================================\n',
	);

	// Tworzymy nową odpowiedź z przekazanym requestem
	let response = NextResponse.next({
		request,
	});

	response.headers.set('x-middleware-cache', 'no-cache');

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					response = NextResponse.next({
						request,
					});
					response.headers.set('x-middleware-cache', 'no-cache');
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log(
		'👤 User Status:',
		user ? '✅ Logged in' : '❌ Not logged in',
	);

	// Obsługa starego formatu linku resetowania hasła
	if (
		type === 'recovery' &&
		token &&
		pathname.includes('/auth/v1/verify')
	) {
		console.log('🔄 Old recovery flow detected!');
		const redirectUrl = new URL('/reset-password', request.url);
		console.log(
			'➡️ Redirecting to reset-password:',
			redirectUrl.toString(),
		);
		return NextResponse.redirect(redirectUrl);
	}

	// Obsługa nowego formatu linku resetowania hasła
	if (code && pathname === '/') {
		console.log('🔄 New recovery flow detected!');
		const redirectUrl = new URL('/reset-password', request.url);
		redirectUrl.searchParams.set('code', code);
		console.log(
			'➡️ Redirecting to reset-password:',
			redirectUrl.toString(),
		);
		return NextResponse.redirect(redirectUrl);
	}

	// Sprawdź czy ścieżka jest chroniona
	const isProtectedPath = PROTECTED_PATHS.some((path) =>
		pathname.startsWith(path),
	);

	console.log(
		'🔒 Path protection:',
		isProtectedPath ? 'Protected' : 'Public',
	);

	// Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
	if (!user && isProtectedPath) {
		console.log('⛔ Unauthorized access, redirecting to login');
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania/rejestracji
	if (user && PUBLIC_PATHS.includes(pathname)) {
		console.log('👥 Logged user accessing public path');
		if (pathname === '/reset-password') {
			console.log('✅ Allowing access to reset-password');
			return response;
		}
		console.log('➡️ Redirecting to generate page');
		return NextResponse.redirect(new URL('/generate', request.url));
	}

	console.log('✅ Proceeding with request\n');
	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
		'/auth/:path*',
		'/auth/v1/:path*',
	],
};
