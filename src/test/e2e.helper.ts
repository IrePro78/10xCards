import { createClient } from '@supabase/supabase-js';

/**
 * Prosty helper do testów e2e z Supabase
 * Używa zmiennych z .env.test lub zmiennych środowiskowych CI
 */
export function createE2ESupabaseClient() {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'Brak konfiguracji SUPABASE_URL lub SUPABASE_PUBLIC_KEY. Sprawdź zmienne środowiskowe.',
		);
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

/**
 * Tworzy klienta Supabase z uwierzytelnionym użytkownikiem testowym
 */
export async function createAuthenticatedE2ESupabaseClient() {
	const supabase = createE2ESupabaseClient();
	const userData = getE2EUserData();

	// Sprawdź czy dane użytkownika są dostępne
	if (!userData.username || !userData.password || !userData.id) {
		throw new Error(
			'Brak danych logowania użytkownika testowego (E2E_USERNAME_ID, E2E_USERNAME, E2E_PASSWORD). Sprawdź zmienne środowiskowe.',
		);
	}

	// Sprawdź czy użytkownik jest już zalogowany
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user && user.id === userData.id) {
		console.log('✅ Użytkownik testowy już zalogowany');
		return supabase;
	}

	// Zaloguj się jako użytkownik testowy
	console.log('🔐 Logowanie użytkownika testowego...');
	const { data, error } = await supabase.auth.signInWithPassword({
		email: userData.username,
		password: userData.password,
	});

	if (error) {
		console.error('Błąd podczas logowania:', error);
		throw new Error(
			`Nie można zalogować użytkownika testowego: ${error.message}`,
		);
	}

	if (!data.user) {
		throw new Error('Logowanie nie zwróciło danych użytkownika');
	}

	console.log('✅ Użytkownik testowy zalogowany:', data.user.id);
	return supabase;
}

/**
 * Dane użytkownika testowego z .env.test
 */
export function getE2EUserData() {
	return {
		id: process.env.E2E_USERNAME_ID,
		username: process.env.E2E_USERNAME,
		password: process.env.E2E_PASSWORD,
	};
}

/**
 * Sprawdza czy wszystkie wymagane zmienne środowiskowe są dostępne
 */
export function validateE2EConfig() {
	const required = [
		'SUPABASE_URL',
		'SUPABASE_PUBLIC_KEY',
		'E2E_USERNAME_ID',
		'E2E_USERNAME',
		'E2E_PASSWORD',
	];
	const missing = required.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Brak wymaganych zmiennych środowiskowych: ${missing.join(', ')}`,
		);
	}

	return true;
}
