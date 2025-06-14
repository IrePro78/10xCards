import { test, expect } from '@playwright/test';
import {
	createAuthenticatedE2ESupabaseClient,
	validateE2EConfig,
} from '../../src/test/e2e.helper';

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
	});
});
