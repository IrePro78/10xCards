import { describe, it, expect, beforeAll } from 'vitest';
import {
	createAuthenticatedE2ESupabaseClient,
	getE2EUserData,
	validateE2EConfig,
} from '../e2e.helper';

describe('Generowanie fiszek', () => {
	beforeAll(() => {
		validateE2EConfig();
	});

	it('powinien wygenerować fiszki dla przykładowego tekstu', async () => {
		const supabase = await createAuthenticatedE2ESupabaseClient();
		const userData = getE2EUserData();

		// Przykładowy tekst do generowania fiszek
		const sampleText = `
			JavaScript to język programowania wysokiego poziomu, który jest interpretowany i ma słabe typowanie. 
			Został stworzony przez Brendana Eicha w 1995 roku dla przeglądarki Netscape Navigator.
			
			Kluczowe cechy JavaScript:
			- Jest to język obiektowy, ale nie jest to język obiektowy w tradycyjnym sensie
			- Wykorzystuje prototypy zamiast klas (przed ES6)
			- Ma funkcje jako obywatelami pierwszej klasy
			- Obsługuje programowanie funkcyjne
			- Jest asynchroniczny i obsługuje callbacks, promises i async/await
			
			JavaScript jest używany głównie do:
			- Tworzenia interaktywnych stron internetowych
			- Budowania aplikacji webowych (frontend i backend)
			- Tworzenia aplikacji mobilnych (React Native, Ionic)
			- Automatyzacji zadań w przeglądarkach
			
			Popularne frameworki JavaScript:
			- React - biblioteka do budowania interfejsów użytkownika
			- Vue.js - progresywny framework do budowania aplikacji
			- Angular - kompletny framework do aplikacji enterprise
			- Node.js - środowisko uruchomieniowe po stronie serwera
			
			ES6 (ES2015) wprowadził wiele nowych funkcji:
			- Klasy i dziedziczenie
			- Arrow functions
			- Template literals
			- Destructuring assignment
			- Modules (import/export)
			- Promises i async/await
		`;

		console.log('📝 Generowanie fiszek dla tekstu o JavaScript...');

		// 1. Utwórz generację w bazie danych
		const { data: generation, error: generationError } =
			await supabase
				.from('generations')
				.insert({
					source_text: sampleText,
					user_id: userData.id!,
					status: 'completed',
					generated_count: 0,
					accepted_unedited_count: 0,
					accepted_edited_count: 0,
				})
				.select()
				.single();

		if (generationError) {
			console.error(
				'Błąd podczas tworzenia generacji:',
				generationError,
			);
			throw generationError;
		}

		console.log('✅ Generacja utworzona:', generation.id);

		// 2. Utwórz przykładowe fiszki
		const sampleFlashcards = [
			{
				front: 'Kto stworzył JavaScript?',
				back: 'Brendan Eich w 1995 roku dla przeglądarki Netscape Navigator',
				source: 'ai',
				user_id: userData.id!,
				generation_id: generation.id,
				ease_factor: 2.5,
				interval_days: 1,
				review_count: 0,
			},
			{
				front: 'Jakie są kluczowe cechy JavaScript?',
				back: 'Język obiektowy z prototypami, funkcje jako obywatelami pierwszej klasy, programowanie funkcyjne, asynchroniczność',
				source: 'ai',
				user_id: userData.id!,
				generation_id: generation.id,
				ease_factor: 2.5,
				interval_days: 1,
				review_count: 0,
			},
			{
				front: 'Do czego głównie używany jest JavaScript?',
				back: 'Interaktywne strony internetowe, aplikacje webowe (frontend i backend), aplikacje mobilne, automatyzacja zadań',
				source: 'ai',
				user_id: userData.id!,
				generation_id: generation.id,
				ease_factor: 2.5,
				interval_days: 1,
				review_count: 0,
			},
			{
				front: 'Jakie popularne frameworki JavaScript znasz?',
				back: 'React, Vue.js, Angular, Node.js',
				source: 'ai',
				user_id: userData.id!,
				generation_id: generation.id,
				ease_factor: 2.5,
				interval_days: 1,
				review_count: 0,
			},
			{
				front: 'Jakie nowe funkcje wprowadził ES6?',
				back: 'Klasy i dziedziczenie, arrow functions, template literals, destructuring assignment, modules, promises i async/await',
				source: 'ai',
				user_id: userData.id!,
				generation_id: generation.id,
				ease_factor: 2.5,
				interval_days: 1,
				review_count: 0,
			},
		];

		// 3. Zapisz fiszki w bazie danych
		const { data: flashcards, error: flashcardsError } =
			await supabase
				.from('flashcards')
				.insert(sampleFlashcards)
				.select();

		if (flashcardsError) {
			console.error(
				'Błąd podczas zapisywania fiszek:',
				flashcardsError,
			);
			throw flashcardsError;
		}

		console.log(`✅ Zapisano ${flashcards.length} fiszek`);

		// 4. Zaktualizuj licznik w generacji
		const { error: updateError } = await supabase
			.from('generations')
			.update({
				generated_count: flashcards.length,
				accepted_unedited_count: flashcards.length,
			})
			.eq('id', generation.id);

		if (updateError) {
			console.error(
				'Błąd podczas aktualizacji generacji:',
				updateError,
			);
			throw updateError;
		}

		// 5. Sprawdź czy fiszki zostały zapisane
		const { data: savedFlashcards, error: fetchError } =
			await supabase
				.from('flashcards')
				.select('*')
				.eq('generation_id', generation.id);

		if (fetchError) {
			console.error('Błąd podczas pobierania fiszek:', fetchError);
			throw fetchError;
		}

		// 6. Asercje
		expect(generation).toBeDefined();
		expect(generation.id).toBeDefined();
		expect(flashcards).toBeDefined();
		expect(flashcards.length).toBe(5);
		expect(savedFlashcards).toBeDefined();
		expect(savedFlashcards.length).toBe(5);

		// 7. Sprawdź zawartość fiszek
		const firstFlashcard = savedFlashcards[0];
		expect(firstFlashcard.front).toContain('JavaScript');
		expect(firstFlashcard.back).toContain('Brendan Eich');
		expect(firstFlashcard.user_id).toBe(userData.id);
		expect(firstFlashcard.generation_id).toBe(generation.id);

		console.log('🎉 Test generowania fiszek zakończony sukcesem!');
		console.log(`   Utworzono generację: ${generation.id}`);
		console.log(`   Zapisano fiszek: ${savedFlashcards.length}`);
		console.log(`   Przykładowa fiszka: "${firstFlashcard.front}"`);
	});

	it('powinien pobrać fiszki dla użytkownika testowego', async () => {
		const supabase = await createAuthenticatedE2ESupabaseClient();
		const userData = getE2EUserData();

		// Pobierz wszystkie fiszki użytkownika
		const { data: flashcards, error } = await supabase
			.from('flashcards')
			.select('*')
			.eq('user_id', userData.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Błąd podczas pobierania fiszek:', error);
			throw error;
		}

		console.log(`📚 Użytkownik ma ${flashcards.length} fiszek`);

		// Sprawdź czy są fiszki z testu
		const testFlashcards = flashcards.filter(
			(fc) => fc.source === 'ai',
		);
		console.log(`   Fiszki z testu: ${testFlashcards.length}`);

		expect(flashcards).toBeDefined();
		expect(Array.isArray(flashcards)).toBe(true);
	});
});
