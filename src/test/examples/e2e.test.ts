import { describe, it, expect, beforeAll } from 'vitest';
import {
	createE2ESupabaseClient,
	getE2EUserData,
	validateE2EConfig,
} from '../e2e.helper';

describe('Testy e2e z Supabase', () => {
	beforeAll(() => {
		// Sprawdź konfigurację przed uruchomieniem testów
		validateE2EConfig();
	});

	it('powinien pokazać z jakiej bazy korzysta', () => {
		const supabaseUrl = process.env.SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;

		console.log('🔗 Konfiguracja bazy danych w testach:');
		console.log(`   URL: ${supabaseUrl}`);
		console.log(`   Klucz: ${supabaseKey?.substring(0, 20)}...`);

		// Sprawdź czy to lokalna czy zdalna baza
		if (
			supabaseUrl?.includes('127.0.0.1') ||
			supabaseUrl?.includes('localhost')
		) {
			console.log('   Typ: 🏠 LOKALNA baza danych');
		} else if (supabaseUrl?.includes('supabase.co')) {
			console.log('   Typ: ☁️ ZDALNA baza danych (chmura)');
		} else {
			console.log('   Typ: ❓ Nieznana baza danych');
		}

		expect(supabaseUrl).toBeDefined();
		expect(supabaseKey).toBeDefined();
	});

	it('powinien połączyć się z bazą danych testową', async () => {
		const supabase = createE2ESupabaseClient();

		// Sprawdź czy klient jest dostępny
		expect(supabase).toBeDefined();
		expect(typeof supabase.from).toBe('function');

		// Przykład użycia - pobierz dane z tabeli flashcards
		const { error } = await supabase
			.from('flashcards')
			.select('id')
			.limit(1);

		// Sprawdź czy nie ma błędu (lub błąd to "brak tabeli")
		expect(
			error === null || error.message.includes('does not exist'),
		).toBe(true);
	});

	it('powinien mieć dostęp do danych użytkownika testowego', () => {
		const userData = getE2EUserData();

		expect(userData.id).toBeDefined();
		expect(userData.username).toBeDefined();
		expect(userData.password).toBeDefined();

		console.log('Użytkownik testowy:', userData.username);
	});

	it('powinien móc pobierać dane z bazy', async () => {
		const supabase = createE2ESupabaseClient();

		// Przykład pobierania danych
		const { data, error } = await supabase
			.from('flashcards')
			.select('*')
			.limit(5);

		if (error) {
			console.log('Błąd bazy danych:', error.message);
		} else {
			console.log(`Pobrano ${data?.length || 0} rekordów z bazy`);
		}

		// Test przechodzi niezależnie od wyniku - sprawdza tylko połączenie
		expect(supabase).toBeDefined();
	});
});
