import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
];

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});
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
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// const {
	// 	data: { user },
	// } = await supabase.auth.getUser();
	// if (
	// 	!user &&
	// 	!request.nextUrl.pathname.startsWith('/login') &&
	// 	!request.nextUrl.pathname.startsWith('/auth')
	// ) {
	// 	// no user, potentially respond by redirecting the user to the login page
	// 	const url = request.nextUrl.clone();
	// 	url.pathname = '/login';
	// 	return NextResponse.redirect(url);
	// }

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
	return supabaseResponse;
}

// Definiuje na jakich ścieżkach middleware będzie uruchamiany
export const config = {
	matcher: [
		// Wyklucza statyczne zasoby
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
