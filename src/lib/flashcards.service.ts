import { SupabaseClient } from '@/db/supabase.client';
import type {
	CreateFlashcardCommandDto,
	FlashcardDto,
} from '@/types/types';

export class FlashcardsService {
	constructor(private readonly supabase: SupabaseClient) {}

	/**
	 * Tworzy nowe fiszki dla użytkownika.
	 *
	 * @param user_id - Identyfikator użytkownika
	 * @param flashcards - Tablica obiektów reprezentujących nowe fiszki
	 * @returns Tablica utworzonych fiszek
	 */
	async createFlashcards(
		user_id: string,
		flashcards: CreateFlashcardCommandDto[],
	): Promise<FlashcardDto[]> {
		// Przygotowanie danych do wstawienia
		const flashcardsToInsert = flashcards.map((flashcard) => ({
			...flashcard,
			user_id,
			// Mapowanie source 'manual' na 'user' w bazie danych
			source:
				flashcard.source === 'manual' ? 'user' : flashcard.source,
		}));

		// Wstawienie fiszek do bazy danych
		const { data, error } = await this.supabase
			.from('flashcards')
			.insert(flashcardsToInsert)
			.select();

		if (error) {
			throw new Error(
				`Błąd podczas tworzenia fiszek: ${error.message}`,
			);
		}

		return data;
	}

	/**
	 * Pobiera fiszki użytkownika z opcjonalną paginacją.
	 *
	 * @param user_id - Identyfikator użytkownika
	 * @param page - Numer strony (opcjonalnie)
	 * @param per_page - Liczba elementów na stronę (opcjonalnie)
	 * @returns Tablica fiszek użytkownika
	 */
	async getFlashcards(
		user_id: string,
		page?: number,
		per_page?: number,
	): Promise<FlashcardDto[]> {
		let query = this.supabase
			.from('flashcards')
			.select('*')
			.eq('user_id', user_id)
			.order('created_at', { ascending: false });

		// Dodanie paginacji, jeśli podano parametry
		if (page && per_page) {
			const start = (page - 1) * per_page;
			query = query.range(start, start + per_page - 1);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(
				`Błąd podczas pobierania fiszek: ${error.message}`,
			);
		}

		return data;
	}
}
