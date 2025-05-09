import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	// Inicjalizacja odpowiedzi z nagłówkiem cache
	const response = NextResponse.next();
	response.headers.set('x-middleware-cache', 'no-cache');

	// Tutaj możemy dodać logikę dla uwierzytelniania Supabase
	// poprzez sprawdzenie plików cookie z tokenami

	return response;
}

// Definiuje na jakich ścieżkach middleware będzie uruchamiany
export const config = {
	matcher: [
		// Wyklucza statyczne zasoby
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
