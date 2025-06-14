import { createClient } from '@supabase/supabase-js';

/**
 * Prosty storage w pamięci dla testów e2e
 */
const memoryStorage = new Map<string, string>();

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

	console.log('🔌 Tworzę klienta Supabase:', {
		url: supabaseUrl,
		key: `${supabaseKey.slice(0, 10)}...`,
	});

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			storage: {
				getItem: (key: string) => {
					console.log('📦 Pobieranie z storage:', key);
					const value = memoryStorage.get(key);
					console.log(
						'📦 Wartość z storage:',
						value ? 'znaleziono' : 'brak',
					);
					return value ?? null;
				},
				setItem: (key: string, value: string) => {
					console.log('📦 Zapisywanie do storage:', key, value);
					memoryStorage.set(key, value);
				},
				removeItem: (key: string) => {
					console.log('📦 Usuwanie z storage:', key);
					memoryStorage.delete(key);
				},
			},
		},
	});
}

/**
 * Czeka na dostępność tokenu sesji
 */
async function waitForSession(
	supabase: ReturnType<typeof createE2ESupabaseClient>,
	maxAttempts = 10,
) {
	for (let i = 0; i < maxAttempts; i++) {
		console.log(
			`🔄 Próba ${i + 1}/${maxAttempts} - czekam na token sesji...`,
		);
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (session?.access_token) {
			console.log('✅ Token sesji dostępny');
			return session;
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error(
		`Nie udało się uzyskać tokenu sesji po ${maxAttempts} próbach`,
	);
}

/**
 * Tworzy klienta Supabase z uwierzytelnionym użytkownikiem testowym
 */
export async function createAuthenticatedE2ESupabaseClient() {
	const supabase = createE2ESupabaseClient();
	const userData = getE2EUserData();

	console.log('👤 Dane użytkownika testowego:', {
		id: userData.id,
		email: userData.username,
	});

	// Sprawdź czy dane użytkownika są dostępne
	if (!userData.username || !userData.password || !userData.id) {
		throw new Error(
			'Brak danych logowania użytkownika testowego (E2E_USERNAME_ID, E2E_USERNAME, E2E_PASSWORD). Sprawdź zmienne środowiskowe.',
		);
	}

	// Sprawdź czy użytkownik jest już zalogowany
	console.log('🔍 Sprawdzam czy użytkownik jest już zalogowany...');
	try {
		await waitForSession(supabase);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user && user.id === userData.id) {
			console.log('✅ Użytkownik testowy już zalogowany:', user.id);
			return supabase;
		}
	} catch {
		console.log(
			'❌ Użytkownik nie jest zalogowany, próbuję zalogować...',
		);
	}

	// Zaloguj się jako użytkownik testowy
	console.log('🔐 Próba logowania użytkownika testowego...');
	const { data, error } = await supabase.auth.signInWithPassword({
		email: userData.username,
		password: userData.password,
	});

	if (error) {
		console.error('❌ Błąd podczas logowania:', {
			message: error.message,
			status: error.status,
			name: error.name,
		});
		throw new Error(
			`Nie można zalogować użytkownika testowego: ${error.message}`,
		);
	}

	if (!data.user) {
		console.error('❌ Logowanie nie zwróciło danych użytkownika');
		throw new Error('Logowanie nie zwróciło danych użytkownika');
	}

	// Poczekaj na dostępność tokenu sesji
	await waitForSession(supabase);

	console.log('✅ Użytkownik testowy zalogowany:', {
		id: data.user.id,
		email: data.user.email,
	});
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
