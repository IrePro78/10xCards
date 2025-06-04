import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	createServerClient,
	type CookieOptions,
} from '@supabase/ssr';

const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
];

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();
	response.headers.set('x-middleware-cache', 'no-cache');

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					request.cookies.set({ name, value, ...options });
					response.cookies.set({ name, value, ...options });
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({ name, value: '', ...options });
					response.cookies.set({ name, value: '', ...options });
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
	if (!user && !PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania/rejestracji
	if (user && PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL('/generate', request.url));
	}

	return response;
}

// Definiuje na jakich ścieżkach middleware będzie uruchamiany
export const config = {
	matcher: [
		// Wyklucza statyczne zasoby
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
