import { NextResponse } from 'next/server';
import { logToFile } from '@/lib/logger';
import { createSupabaseServerClient } from '@/db/supabase.server';

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const searchParams = requestUrl.searchParams;
	const code = searchParams.get('code');
	const next = searchParams.get('next');
	const type = searchParams.get('type');
	const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

	logToFile(`\n=== CALLBACK HANDLER CALLED ===`);
	logToFile(`URL: ${request.url}`);
	logToFile(
		`Search Params: ${JSON.stringify(Object.fromEntries(searchParams))}`,
	);
	logToFile(`Code: ${code}`);
	logToFile(`Type: ${type}`);
	logToFile(`Next: ${next}`);

	// Jeśli to jest resetowanie hasła, nie tworzymy sesji
	if (type === 'recovery' && code) {
		// Użyj obecnego hosta jako bazy dla przekierowania
		const redirectUrl = new URL('/reset-password', baseUrl);
		redirectUrl.searchParams.set('code', code);
		redirectUrl.searchParams.set('type', type);

		logToFile(`Redirecting to: ${redirectUrl.toString()}`);

		// Wyloguj użytkownika przed przekierowaniem
		const supabase = await createSupabaseServerClient();
		await supabase.auth.signOut();

		return NextResponse.redirect(redirectUrl);
	}

	// Dla normalnego logowania
	if (code) {
		const supabase = await createSupabaseServerClient();
		const { error } =
			await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error('Błąd wymiany kodu na sesję:', error);
			return NextResponse.redirect(new URL('/login', baseUrl));
		}

		return NextResponse.redirect(new URL('/generate', baseUrl));
	}

	// Domyślne przekierowanie
	return NextResponse.redirect(new URL('/login', baseUrl));
}
