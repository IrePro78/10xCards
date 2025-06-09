import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	CreateFlashcardCommandDto,
	FlashcardDto,
	FlashcardsQueryParams,
	FlashcardsListResponseDto,
	FlashcardListDto,
	UpdateFlashcardCommandDto,
} from '@/types/types';
import type { Database } from '@/db/database.types';

// Schema dla parametrów zapytania GET /flashcards
const flashcardsQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 1))
		.pipe(z.number().min(1)),
	per_page: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 10))
		.pipe(z.number().min(1).max(100)),
	search: z.string().optional(),
	sort: z
		.enum(['created_at', 'updated_at', 'front', 'back'])
		.optional()
		.default('created_at'),
});

export class FlashcardsService {
	constructor(private readonly supabase: SupabaseClient<Database>) {}

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
	 * Pobiera paginowaną listę fiszek użytkownika z opcjonalnym wyszukiwaniem i sortowaniem.
	 *
	 * @param userId - Identyfikator użytkownika
	 * @param params - Parametry zapytania (strona, liczba elementów, wyszukiwanie, sortowanie)
	 * @returns Obiekt zawierający fiszki i informacje o paginacji
	 */
	async getFlashcards(
		userId: string,
		params: FlashcardsQueryParams,
	): Promise<FlashcardsListResponseDto> {
		// Walidacja parametrów zapytania
		const validatedParams = flashcardsQuerySchema.parse(params);
		const {
			page = 1,
			per_page = 10,
			search,
			sort = 'created_at',
		} = validatedParams;
		const offset = (page - 1) * per_page;

		let query = this.supabase
			.from('flashcards')
			.select('id, front, back, source, created_at, updated_at')
			.eq('user_id', userId)
			.order(sort, { ascending: false });

		if (search) {
			query = query.or(
				`front.ilike.%${search}%,back.ilike.%${search}%`,
			);
		}

		const { data: flashcards, error } = await query
			.range(offset, offset + per_page - 1)
			.returns<FlashcardListDto[]>();

		if (error) {
			throw new Error(`Failed to fetch flashcards: ${error.message}`);
		}

		const total = await this.getFlashcardsCount(userId, search);
		const total_pages = Math.ceil(total / per_page);

		return {
			flashcards,
			pagination: {
				page,
				per_page,
				total_pages,
				total_items: total,
			},
		};
	}

	private async getFlashcardsCount(
		userId: string,
		search?: string,
	): Promise<number> {
		let query = this.supabase
			.from('flashcards')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId);

		if (search) {
			query = query.or(
				`front.ilike.%${search}%,back.ilike.%${search}%`,
			);
		}

		const { count, error } = await query;

		if (error) {
			throw new Error(`Failed to count flashcards: ${error.message}`);
		}

		return count || 0;
	}
}

/**
 * Aktualizuje istniejącą fiszkę, weryfikując właściciela
 *
 * @param supabase - Klient Supabase
 * @param id - ID fiszki
 * @param data - Dane do aktualizacji
 * @param userId - ID użytkownika (tymczasowo DEFAULT_USER_ID)
 */
export async function updateFlashcard(
	supabase: SupabaseClient<Database>,
	id: string,
	data: UpdateFlashcardCommandDto,
	userId: string,
): Promise<Database['public']['Tables']['flashcards']['Row']> {
	const { data: updatedFlashcard, error } = await supabase
		.from('flashcards')
		.update({
			...data,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) throw error;
	if (!updatedFlashcard) throw new Error('Flashcard not found');

	return updatedFlashcard;
}

/**
 * Usuwa fiszkę, weryfikując właściciela
 *
 * @param supabase - Klient Supabase
 * @param id - ID fiszki
 * @param userId - ID użytkownika (tymczasowo DEFAULT_USER_ID)
 */
export async function deleteFlashcard(
	supabase: SupabaseClient<Database>,
	id: string,
	userId: string,
): Promise<void> {
	const { error } = await supabase
		.from('flashcards')
		.delete()
		.eq('id', id)
		.eq('user_id', userId);

	if (error) throw error;
}
