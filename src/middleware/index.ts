import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
];

const PROTECTED_PATHS = ['/generate', '/flashcards', '/profile'];

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	// Dodaj nagłówek no-cache dla lepszego debugowania
	supabaseResponse.headers.set('x-middleware-cache', 'no-cache');

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
					supabaseResponse = NextResponse.next({
						request,
					});
					supabaseResponse.headers.set(
						'x-middleware-cache',
						'no-cache',
					);
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const pathname = request.nextUrl.pathname;

	// Sprawdź czy ścieżka jest chroniona
	const isProtectedPath = PROTECTED_PATHS.some((path) =>
		pathname.startsWith(path),
	);

	// Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
	if (!user && isProtectedPath) {
		console.log(`Unauthorized access attempt to ${pathname}`);
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania/rejestracji
	if (user && PUBLIC_PATHS.includes(pathname)) {
		return NextResponse.redirect(new URL('/generate', request.url));
	}

	return supabaseResponse;
}

// Definiuje na jakich ścieżkach middleware będzie uruchamiany
export const config = {
	matcher: [
		/*
		 * Dopasuj wszystkie ścieżki żądań z wyjątkiem tych zaczynających się od:
		 * - _next/static (pliki statyczne)
		 * - _next/image (pliki optymalizacji obrazów)
		 * - favicon.ico (plik favicon)
		 * - pliki graficzne
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
