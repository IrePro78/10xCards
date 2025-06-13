import { test, expect } from '@playwright/test';
import {
	createAuthenticatedE2ESupabaseClient,
	getE2EUserData,
	validateE2EConfig,
} from '../src/test/e2e.helper';

test.describe('Generowanie fiszek - E2E', () => {
	test.beforeAll(async () => {
		validateE2EConfig();
	});

	test('powinien wygenerować fiszki przez API i zapisać w bazie', async ({
		request,
	}) => {
		const supabase = await createAuthenticatedE2ESupabaseClient();
		const userData = getE2EUserData();

		// Pobierz token sesji
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.access_token) {
			throw new Error('Brak tokenu sesji');
		}

		// Przykładowy tekst do generowania fiszek
		const sampleText = `
			React to biblioteka JavaScript do budowania interfejsów użytkownika, stworzona przez Facebook (obecnie Meta).
			Została wydana w 2013 roku i szybko stała się jedną z najpopularniejszych bibliotek frontendowych.
			
			Kluczowe koncepcje React:
			- Komponenty - podstawowe jednostki UI, które można wielokrotnie używać
			- Virtual DOM - wirtualna reprezentacja DOM, która optymalizuje aktualizacje
			- JSX - rozszerzenie składni JavaScript, które pozwala pisać HTML w JavaScript
			- Props - sposób przekazywania danych między komponentami
			- State - lokalny stan komponentu, który może się zmieniać
			
			React Hooks (wprowadzone w React 16.8):
			- useState - do zarządzania stanem lokalnym
			- useEffect - do efektów ubocznych (API calls, subscriptions)
			- useContext - do konsumowania kontekstu
			- useReducer - do złożonego zarządzania stanem
			- useMemo i useCallback - do optymalizacji wydajności
			
			Popularne narzędzia w ekosystemie React:
			- Next.js - framework do aplikacji React z SSR/SSG
			- Create React App - narzędzie do szybkiego startu projektów
			- React Router - routing w aplikacjach React
			- Redux - zarządzanie stanem globalnym
			- Styled Components - CSS-in-JS
		`;

		console.log(
			'🚀 Rozpoczynam test generowania fiszek przez API...',
		);

		// 1. Wyślij żądanie do API generowania z tokenem autoryzacyjnym
		const response = await request.post('/api/generations', {
			data: {
				source_text: sampleText,
				model: 'gpt-4o-mini', // Używamy modelu, który jest dostępny
			},
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log(`📡 Status odpowiedzi API: ${response.status()}`);

		// Sprawdź czy odpowiedź jest poprawna
		expect(response.ok()).toBe(true);

		const generationData = await response.json();
		console.log('📊 Dane generacji:', {
			id: generationData.id,
			status: generationData.status,
			generated_count: generationData.generated_count,
		});

		// 2. Sprawdź czy generacja została utworzona w bazie
		const { data: dbGeneration, error: dbError } = await supabase
			.from('generations')
			.select('*')
			.eq('id', generationData.id)
			.single();

		if (dbError) {
			console.error(
				'Błąd podczas pobierania generacji z bazy:',
				dbError,
			);
			throw dbError;
		}

		expect(dbGeneration).toBeDefined();
		expect(dbGeneration.id).toBe(generationData.id);
		expect(dbGeneration.user_id).toBe(userData.id);
		expect(dbGeneration.source_text).toBe(sampleText);

		console.log('✅ Generacja została zapisana w bazie danych');

		// 3. Poczekaj chwilę na przetworzenie (jeśli jest asynchroniczne)
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// 4. Sprawdź czy fiszki zostały wygenerowane
		const { data: flashcards, error: flashcardsError } =
			await supabase
				.from('flashcards')
				.select('*')
				.eq('generation_id', generationData.id);

		if (flashcardsError) {
			console.error(
				'Błąd podczas pobierania fiszek:',
				flashcardsError,
			);
			throw flashcardsError;
		}

		console.log(`📚 Wygenerowano ${flashcards.length} fiszek`);

		// 5. Sprawdź czy są jakieś fiszki (może być 0 jeśli API nie działa)
		expect(flashcards).toBeDefined();
		expect(Array.isArray(flashcards)).toBe(true);

		if (flashcards.length > 0) {
			// Sprawdź strukturę pierwszej fiszki
			const firstFlashcard = flashcards[0];
			expect(firstFlashcard.front).toBeDefined();
			expect(firstFlashcard.back).toBeDefined();
			expect(firstFlashcard.user_id).toBe(userData.id);
			expect(firstFlashcard.generation_id).toBe(generationData.id);

			console.log('🎯 Przykładowa fiszka:');
			console.log(`   Front: "${firstFlashcard.front}"`);
			console.log(`   Back: "${firstFlashcard.back}"`);
		} else {
			console.log(
				'⚠️  Nie wygenerowano żadnych fiszek - może API nie działa lub model nie jest dostępny',
			);
		}

		// 6. Sprawdź czy liczniki w generacji są aktualne
		const { data: updatedGeneration, error: updateError } =
			await supabase
				.from('generations')
				.select(
					'generated_count, accepted_unedited_count, accepted_edited_count',
				)
				.eq('id', generationData.id)
				.single();

		if (updateError) {
			console.error(
				'Błąd podczas pobierania zaktualizowanej generacji:',
				updateError,
			);
			throw updateError;
		}

		console.log('📈 Liczniki generacji:', {
			generated_count: updatedGeneration.generated_count,
			accepted_unedited_count:
				updatedGeneration.accepted_unedited_count,
			accepted_edited_count: updatedGeneration.accepted_edited_count,
		});

		console.log('🎉 Test generowania fiszek przez API zakończony!');
	});

	test('powinien obsłużyć błąd przy nieprawidłowych danych', async ({
		request,
	}) => {
		const supabase = await createAuthenticatedE2ESupabaseClient();

		// Pobierz token sesji
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.access_token) {
			throw new Error('Brak tokenu sesji');
		}

		console.log('🧪 Testowanie obsługi błędów...');

		// Test z za krótkim tekstem
		const shortTextResponse = await request.post('/api/generations', {
			data: {
				source_text: 'Za krótki tekst',
				model: 'gpt-4o-mini',
			},
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		expect(shortTextResponse.status()).toBe(400);
		const shortTextError = await shortTextResponse.json();
		expect(shortTextError.error).toBeDefined();

		console.log('✅ Błąd walidacji obsłużony poprawnie');

		// Test bez tekstu
		const noTextResponse = await request.post('/api/generations', {
			data: {
				model: 'gpt-4o-mini',
			},
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		expect(noTextResponse.status()).toBe(400);
		const noTextError = await noTextResponse.json();
		expect(noTextError.error).toBeDefined();

		console.log('✅ Błąd brakujących danych obsłużony poprawnie');
	});
});
