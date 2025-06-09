import { SupabaseClient } from '@/db/supabase.client';
import { GenerationWithCandidatesDto } from '@/types/types';
import { OpenRouterService } from './openrouter.service';
import { Database } from '@/db/database.types';

type Generation = Database['public']['Tables']['generations']['Row'];

export class GenerationsService {
	constructor(
		private readonly supabase: SupabaseClient,
		private readonly openRouter: OpenRouterService,
	) {}

	/**
	 * Tworzy nową sesję generacji fiszek na podstawie tekstu źródłowego.
	 *
	 * @param user_id - Identyfikator użytkownika
	 * @param source_text - Tekst źródłowy
	 * @param model - Nazwa modelu AI używanego do generacji
	 * @returns Dane sesji generacji wraz z kandydującymi fiszkami
	 */
	async createGeneration(
		user_id: string,
		source_text: string,
		model: string,
	): Promise<GenerationWithCandidatesDto> {
		try {
			// Generowanie fiszek przez OpenRouter
			const { flashcards: candidate_flashcards, duration } =
				await this.openRouter.generateFlashcards(source_text, model);

			// Utworzenie rekordu w tabeli generations
			const { data: generation, error } = await this.supabase
				.from('generations')
				.insert({
					user_id,
					source_text,
					status: 'pending',
					generated_count: candidate_flashcards.length,
					accepted_unedited_count: 0,
					accepted_edited_count: 0,
					generation_duration: duration,
				})
				.select<'generations', Generation>()
				.single();

			if (error) {
				throw new Error(
					`Błąd podczas tworzenia sesji generacji: ${error.message}`,
				);
			}

			if (!generation) {
				throw new Error('Nie udało się utworzyć sesji generacji');
			}

			return {
				...generation,
				candidate_flashcards,
			};
		} catch (error) {
			// Logowanie błędu generacji
			if (error instanceof Error) {
				await this.logGenerationError(
					user_id,
					source_text,
					error.message,
				);
			}
			throw error;
		}
	}

	/**
	 * Loguje błąd generacji do bazy danych.
	 *
	 * @param user_id - Identyfikator użytkownika
	 * @param source_text - Tekst źródłowy
	 * @param error_message - Komunikat błędu
	 */
	async logGenerationError(
		user_id: string,
		source_text: string,
		error_message: string,
	): Promise<void> {
		// Tworzymy nową generację w stanie error
		const { data: generation } = await this.supabase
			.from('generations')
			.insert({
				user_id,
				source_text,
				status: 'error',
				generated_count: 0,
				accepted_unedited_count: 0,
				accepted_edited_count: 0,
			})
			.select<'generations', Generation>()
			.single();

		if (generation) {
			await this.supabase.from('generation_error_logs').insert({
				generation_id: generation.id,
				error_message,
			});
		}
	}
}
