import { test, expect } from '@playwright/test';
import {
	createE2ESupabaseClient,
	getE2EUserData,
	validateE2EConfig,
} from '../../src/test/e2e.helper';

test.describe('Połączenie z Supabase - E2E', () => {
	test.beforeAll(async () => {
		validateE2EConfig();
	});

	test('powinien połączyć się z bazą danych testową', async () => {
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

	test('powinien mieć dostęp do danych użytkownika testowego', async () => {
		const userData = getE2EUserData();

		expect(userData.id).toBeDefined();
		expect(userData.username).toBeDefined();
		expect(userData.password).toBeDefined();
	});
});
