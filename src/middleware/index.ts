import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/auth/callback',
];

const PROTECTED_PATHS = ['/generate', '/flashcards', '/profile'];

export async function middleware(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const pathname = requestUrl.pathname;

	// Obsługa przekierowania dla resetu hasła
	if (code) {
		if (pathname === '/reset-password') {
			// Jeśli jesteśmy już na stronie reset-password, nie robimy przekierowania
			console.log('Already on reset-password page');
		} else {
			// W przeciwnym razie przekierowujemy przez callback
			console.log('Redirecting to auth callback');
			return NextResponse.redirect(
				new URL(
					`/auth/callback?code=${code}&next=/reset-password`,
					process.env.NEXT_PUBLIC_SITE_URL,
				),
			);
		}
	}

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

	return response;
}

// Definiuje na jakich ścieżkach middleware będzie uruchamiany
export const config = {
	matcher: [
		/*
		 * Dopasuj wszystkie ścieżki żądań z wyjątkiem tych zaczynających się od:
		 * - _next/static (pliki statyczne)
		 * - _next/image (pliki optymalizacji obrazów)
		 * - favicon.ico (plik favicon)
		 * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (pliki graficzne)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
