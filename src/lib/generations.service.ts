import { SupabaseClient } from '@/db/supabase.client';
import {
	GenerationWithCandidatesDto,
	GenerationCandidateDto,
} from '@/types';
import { createHash } from 'crypto';

export class GenerationsService {
	constructor(private readonly supabase: SupabaseClient) {}

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
		model: string = 'gpt-4',
	): Promise<GenerationWithCandidatesDto> {
		// Obliczanie hasha i długości tekstu źródłowego
		const source_text_hash = createHash('md5')
			.update(source_text)
			.digest('hex');
		const source_text_length = source_text.length;

		// Generowanie kandydujących fiszek (mock)
		const candidate_flashcards = this.generateMockCandidates();

		// Utworzenie rekordu w tabeli generations
		const { data: generation, error } = await this.supabase
			.from('generations')
			.insert({
				user_id,
				model,
				source_text_hash,
				source_text_length,
				generated_count: candidate_flashcards.length,
				accepted_unedited_count: 0,
				accepted_edited_count: 0,
			})
			.select()
			.single();

		if (error) {
			// Logowanie błędu do tabeli generation_error_logs
			await this.supabase.from('generation_error_logs').insert({
				user_id,
				model,
				source_text_hash,
				source_text_length,
				error_message: error.message,
			});

			throw new Error(
				`Błąd podczas tworzenia sesji generacji: ${error.message}`,
			);
		}

		return {
			...generation,
			candidate_flashcards,
		};
	}

	/**
	 * Loguje błąd generacji do bazy danych.
	 *
	 * @param user_id - Identyfikator użytkownika
	 * @param model - Nazwa modelu AI
	 * @param source_text - Tekst źródłowy
	 * @param error_message - Komunikat błędu
	 */
	async logGenerationError(
		user_id: string,
		model: string,
		source_text: string,
		error_message: string,
	): Promise<void> {
		const source_text_hash = createHash('md5')
			.update(source_text)
			.digest('hex');

		await this.supabase.from('generation_error_logs').insert({
			user_id,
			model,
			source_text_hash,
			source_text_length: source_text.length,
			error_message,
		});
	}

	/**
	 * Generuje przykładowe kandydujące fiszki (mock).
	 * W rzeczywistej implementacji byłyby generowane przez model AI.
	 *
	 * @returns Tablica przykładowych kandydujących fiszek
	 */
	private generateMockCandidates(): GenerationCandidateDto[] {
		return [
			{ front: 'Przykładowa fiszka 1', back: 'Odpowiedź 1' },
			{ front: 'Przykładowa fiszka 2', back: 'Odpowiedź 2' },
			{ front: 'Przykładowa fiszka 3', back: 'Odpowiedź 3' },
		];
	}
}
