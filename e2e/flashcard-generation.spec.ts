import { test, expect } from '@playwright/test';
import {
	createAuthenticatedE2ESupabaseClient,
	validateE2EConfig,
} from '../src/test/e2e.helper';

test.describe('Generowanie fiszek - E2E', () => {
	test.beforeAll(async () => {
		validateE2EConfig();
	});

	test('powinien wygenerować fiszki przez API i zwrócić kandydatów', async ({
		request,
	}) => {
		test.setTimeout(120000); // 2 minuty
		const supabase = await createAuthenticatedE2ESupabaseClient();

		// Pobierz token sesji
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.access_token) {
			throw new Error('Brak tokenu sesji');
		}

		// Przykładowy tekst do generowania fiszek (minimum 1000 znaków)
		const sourceText = `
			TypeScript to zaawansowany język programowania stworzony i rozwijany przez Microsoft. Jest to nadzbiór JavaScript, co oznacza, że każdy poprawny kod JavaScript jest również poprawnym kodem TypeScript. Główną cechą wyróżniającą TypeScript jest statyczne typowanie, które pozwala na wykrywanie błędów już na etapie kompilacji.

			Kluczowe cechy TypeScript:
			1. Statyczne typowanie - możliwość definiowania typów zmiennych, parametrów funkcji i wartości zwracanych
			2. Interfejsy - pozwalają na definiowanie kontraktów w kodzie i struktury obiektów
			3. Typy generyczne - umożliwiają tworzenie wielokrotnie używalnych komponentów z różnymi typami danych
			4. Dekoratory - specjalne wyrażenia, które pozwalają na dodawanie metadanych i modyfikowanie zachowania klas
			5. Dziedziczenie - pełne wsparcie dla dziedziczenia klas i implementacji interfejsów
			6. Moduły - system modułów zgodny z ECMAScript i dodatkowo rozszerzony
			7. Narzędzia deweloperskie - świetne wsparcie w edytorach kodu i IDE

			Kompilator TypeScript:
			- Przekształca kod TypeScript na JavaScript
			- Wykonuje statyczną analizę kodu
			- Wspiera różne wersje docelowe JavaScript (ES5, ES6, itd.)
			- Oferuje szereg opcji konfiguracyjnych w tsconfig.json
			- Pozwala na stopniową migrację z JavaScript do TypeScript

			Zaawansowane koncepcje:
			- Union i Intersection Types - łączenie typów
			- Type Guards - zabezpieczenia typów
			- Mapped Types - mapowanie typów
			- Conditional Types - typy warunkowe
			- Utility Types - wbudowane typy pomocnicze
			- Literal Types - typy literałowe
			- Index Types - typy indeksów
			- Module Augmentation - rozszerzanie modułów

			Integracja z narzędziami:
			- Webpack - popularne narzędzie do bundlowania
			- Babel - transpilator JavaScript
			- ESLint - narzędzie do analizy statycznej kodu
			- Jest - framework do testowania
			- React - biblioteka do budowania interfejsów
			- Node.js - środowisko uruchomieniowe
			- Visual Studio Code - edytor z najlepszym wsparciem

			Dobre praktyki:
			1. Używaj strict mode
			2. Definiuj typy dla wszystkich zmiennych
			3. Wykorzystuj interfejsy do definiowania kontraktów
			4. Unikaj typu any
			5. Używaj union types zamiast enum
			6. Implementuj testy jednostkowe
			7. Dokumentuj kod używając JSDoc
			8. Stosuj konwencje nazewnicze
			9. Korzystaj z automatycznego formatowania
			10. Regularnie aktualizuj zależności
		`.trim();

		// Wywołaj endpoint generacji
		const response = await request.post('/api/generations', {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
			data: {
				source_text: sourceText,
			},
		});

		// Sprawdź odpowiedź
		expect(response.status()).toBe(201);
		const data = await response.json();

		// Sprawdź strukturę odpowiedzi
		expect(data).toHaveProperty('id');
		expect(data).toHaveProperty('status', 'pending');
		expect(data).toHaveProperty('candidate_flashcards');
		expect(Array.isArray(data.candidate_flashcards)).toBe(true);
		expect(data.candidate_flashcards.length).toBeGreaterThan(0);
		expect(data.generated_count).toBe(
			data.candidate_flashcards.length,
		);

		// Sprawdź strukturę kandydujących fiszek
		for (const flashcard of data.candidate_flashcards) {
			expect(flashcard).toHaveProperty('front');
			expect(flashcard).toHaveProperty('back');
			expect(typeof flashcard.front).toBe('string');
			expect(typeof flashcard.back).toBe('string');
		}

		// Sprawdź czy nie ma jeszcze fiszek w bazie
		const { data: flashcards } = await supabase
			.from('flashcards')
			.select('*')
			.eq('generation_id', data.id);
		expect(flashcards).toHaveLength(0);
	});

	test('powinien zaakceptować wygenerowane fiszki i zapisać je w bazie', async ({
		request,
	}) => {
		test.setTimeout(120000); // 2 minuty
		const supabase = await createAuthenticatedE2ESupabaseClient();

		// Pobierz token sesji
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.access_token) {
			throw new Error('Brak tokenu sesji');
		}

		// Wygeneruj fiszki (minimum 1000 znaków)
		const sourceText = `
			React to potężna biblioteka JavaScript do budowania interfejsów użytkownika, stworzona przez Facebook (obecnie Meta). Od momentu jej wydania w 2013 roku, React zrewolucjonizował sposób tworzenia aplikacji webowych i stał się jednym z najpopularniejszych narzędzi frontendowych.

			Kluczowe koncepcje React:
			1. Komponenty - podstawowe bloki budulcowe UI
			- Komponenty funkcyjne
			- Komponenty klasowe (legacy)
			- Kompozycja komponentów
			- Props i ich przekazywanie
			- Cykl życia komponentów

			2. JSX - rozszerzenie składni JavaScript
			- Składnia podobna do HTML
			- Wyrażenia JavaScript w klamrach
			- Atrybuty i props
			- Zagnieżdżanie elementów
			- Fragmenty

			3. Virtual DOM
			- Wirtualna reprezentacja DOM
			- Algorytm reconciliation
			- Optymalizacja renderowania
			- Batch updates
			- Fiber architecture

			4. Stan i zarządzanie stanem
			- useState hook
			- useReducer dla złożonego stanu
			- Context API
			- Stan globalny
			- Zarządzanie formularzami

			5. Hooki (wprowadzone w React 16.8)
			- useState - stan lokalny
			- useEffect - efekty uboczne
			- useContext - kontekst
			- useReducer - złożony stan
			- useCallback - memoizacja funkcji
			- useMemo - memoizacja wartości
			- useRef - referencje
			- Własne hooki

			6. Renderowanie warunkowe
			- Operatory logiczne
			- Operator trójargumentowy
			- Early return
			- Switch statements
			- Renderowanie list

			7. Obsługa zdarzeń
			- Handlery zdarzeń
			- Synthetic Events
			- Event bubbling
			- Event delegation
			- Preventing default

			8. Stylowanie w React
			- CSS Modules
			- Styled Components
			- Emotion
			- Tailwind CSS
			- CSS-in-JS

			9. Optymalizacja wydajności
			- React.memo
			- useMemo i useCallback
			- Code splitting
			- Lazy loading
			- Suspense

			10. Narzędzia deweloperskie
			- Create React App
			- React Developer Tools
			- ESLint i Prettier
			- Hot Module Replacement
			- Debug tools
		`.trim();

		const generationResponse = await request.post(
			'/api/generations',
			{
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				data: {
					source_text: sourceText,
				},
			},
		);

		expect(generationResponse.status()).toBe(201);
		const generationData = await generationResponse.json();
		expect(
			generationData.candidate_flashcards.length,
		).toBeGreaterThan(0);

		// Zaakceptuj wygenerowane fiszki
		const userId = (await supabase.auth.getUser()).data.user!.id;
		const flashcardsToAccept =
			generationData.candidate_flashcards.map(
				(flashcard: { front: string; back: string }) => ({
					...flashcard,
					source: 'ai',
					generation_id: generationData.id,
					user_id: userId,
					ease_factor: 2.5,
					interval_days: 1,
					review_count: 0,
				}),
			);

		// Przygotuj fiszki do zapisu z odpowiednim źródłem
		const flashcardsToSave = flashcardsToAccept.map(
			(flashcard: (typeof flashcardsToAccept)[0]) => ({
				...flashcard,
				source: 'ai' as const, // fiszki bezpośrednio z AI, bez edycji
			}),
		);

		// Zapisz fiszki bezpośrednio przez klienta Supabase
		const { data: acceptedFlashcards, error: acceptError } =
			await supabase
				.from('flashcards')
				.insert(flashcardsToSave)
				.select();

		if (acceptError) {
			throw acceptError;
		}

		// Zaktualizuj liczniki w generacji - wszystkie fiszki są niemodyfikowane (ai)
		const { error: updateError } = await supabase
			.from('generations')
			.update({
				status: 'completed',
				accepted_unedited_count: flashcardsToSave.length,
				accepted_edited_count: 0,
				updated_at: new Date().toISOString(),
			})
			.eq('id', generationData.id);

		if (updateError) {
			throw updateError;
		}

		expect(acceptedFlashcards).toHaveLength(flashcardsToSave.length);

		// Sprawdź czy fiszki zostały zapisane w bazie
		const { data: savedFlashcards } = await supabase
			.from('flashcards')
			.select('*')
			.eq('generation_id', generationData.id);

		expect(savedFlashcards).toHaveLength(flashcardsToSave.length);

		// Sprawdź czy status generacji został zaktualizowany
		const { data: updatedGeneration } = await supabase
			.from('generations')
			.select('*')
			.eq('id', generationData.id)
			.single();

		expect(updatedGeneration).toBeTruthy();
		expect(updatedGeneration?.accepted_unedited_count).toBe(
			flashcardsToSave.length,
		);
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
				model: 'openai/gpt-4o-mini',
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
				model: 'openai/gpt-4o-mini',
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
