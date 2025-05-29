import { z } from 'zod';
import { SupabaseClient, supabaseClient } from '@/db/supabase.client';
import type {
	CreateFlashcardCommandDto,
	FlashcardDto,
	FlashcardsQueryParams,
	FlashcardsListResponseDto,
	FlashcardListDto,
} from '@/types/types';

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

// Eksport instancji serwisu z klientem Supabase
export const flashcardsService = new FlashcardsService(
	supabaseClient,
);
