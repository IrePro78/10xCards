import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/db/database.types';

type Tables = Database['public']['Tables'];
type Flashcard = Tables['flashcards']['Row'];
type ReviewSession = Tables['review_sessions']['Row'];

export class ReviewService {
	constructor(private readonly supabase: SupabaseClient<Database>) {}

	/**
	 * Pobiera fiszki do powtórki dla zalogowanego użytkownika
	 * @returns Lista fiszek do powtórki
	 */
	async getCardsForReview(): Promise<Flashcard[]> {
		const {
			data: { user },
			error: userError,
		} = await this.supabase.auth.getUser();
		if (userError) throw userError;
		if (!user) throw new Error('Nie znaleziono użytkownika');

		const { data: flashcards, error } = await this.supabase
			.from('flashcards')
			.select('*')
			.eq('user_id', user.id)
			.or(
				`next_review_at.is.null,next_review_at.lte."${new Date().toISOString()}"`,
			)
			.order('next_review_at', { ascending: true });

		if (error) {
			console.error('Błąd podczas pobierania fiszek:', error);
			throw error;
		}

		console.log('Znalezione fiszki:', flashcards);
		return flashcards || [];
	}

	/**
	 * Rozpoczyna nową sesję powtórek
	 * @returns Dane utworzonej sesji
	 */
	async startReviewSession(): Promise<ReviewSession> {
		const {
			data: { user },
			error: userError,
		} = await this.supabase.auth.getUser();
		if (userError) throw userError;
		if (!user) throw new Error('Nie znaleziono użytkownika');

		const { data: session, error } = await this.supabase
			.from('review_sessions')
			.insert({
				user_id: user.id,
				started_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) throw error;
		return session;
	}

	/**
	 * Zapisuje odpowiedź użytkownika i aktualizuje termin następnej powtórki
	 * @param sessionId ID sesji
	 * @param flashcardId ID fiszki
	 * @param answerQuality Jakość odpowiedzi (0-5)
	 * @param answerTimeMs Czas odpowiedzi w milisekundach
	 */
	async saveAnswer(
		sessionId: string,
		flashcardId: string,
		answerQuality: number,
		answerTimeMs: number,
	): Promise<void> {
		// Pobierz aktualne dane fiszki
		const { data: flashcard, error: flashcardError } =
			await this.supabase
				.from('flashcards')
				.select('*')
				.eq('id', flashcardId)
				.single();

		if (flashcardError) throw flashcardError;
		if (!flashcard) throw new Error('Nie znaleziono fiszki');

		// Oblicz nowe parametry powtórki
		const { nextReviewAt, easeFactor, intervalDays } =
			this.calculateNextReview(
				flashcard.ease_factor || 2.5,
				flashcard.interval_days || 0,
				answerQuality,
			);

		// Zapisz odpowiedź
		const { error: answerError } = await this.supabase
			.from('review_answers')
			.insert({
				session_id: sessionId,
				flashcard_id: flashcardId,
				answer_quality: answerQuality,
				answer_time_ms: answerTimeMs,
			});

		if (answerError) throw answerError;

		// Zaktualizuj fiszkę
		const { error: updateError } = await this.supabase
			.from('flashcards')
			.update({
				next_review_at: nextReviewAt.toISOString(),
				last_review_at: new Date().toISOString(),
				ease_factor: easeFactor,
				interval_days: intervalDays,
				review_count: (flashcard.review_count || 0) + 1,
			})
			.eq('id', flashcardId);

		if (updateError) throw updateError;
	}

	/**
	 * Kończy sesję powtórek
	 * @param sessionId ID sesji
	 */
	async completeSession(sessionId: string): Promise<void> {
		// Pobierz statystyki sesji
		const { data: answers, error: statsError } = await this.supabase
			.from('review_answers')
			.select('answer_quality')
			.eq('session_id', sessionId);

		if (statsError) throw statsError;
		if (!answers) throw new Error('Nie znaleziono odpowiedzi');

		const correctAnswers = answers.filter(
			(a) => a.answer_quality >= 3,
		).length;
		const incorrectAnswers = answers.length - correctAnswers;

		// Zaktualizuj sesję
		const { error: updateError } = await this.supabase
			.from('review_sessions')
			.update({
				completed_at: new Date().toISOString(),
				total_cards: answers.length,
				correct_answers: correctAnswers,
				incorrect_answers: incorrectAnswers,
			})
			.eq('id', sessionId);

		if (updateError) throw updateError;
	}

	/**
	 * Oblicza parametry następnej powtórki na podstawie algorytmu SuperMemo 2
	 * @param currentEaseFactor Aktualny współczynnik łatwości
	 * @param currentInterval Aktualny interwał w dniach
	 * @param answerQuality Jakość odpowiedzi (0-5)
	 */
	private calculateNextReview(
		currentEaseFactor: number,
		currentInterval: number,
		answerQuality: number,
	) {
		// Implementacja algorytmu SuperMemo 2
		let intervalDays: number;
		if (currentInterval === 0) {
			intervalDays = 1;
		} else if (currentInterval === 1) {
			intervalDays = 6;
		} else {
			intervalDays = Math.round(currentInterval * currentEaseFactor);
		}

		// Aktualizacja współczynnika łatwości
		const easeFactor = Math.max(
			1.3,
			currentEaseFactor +
				(0.1 -
					(5 - answerQuality) * (0.08 + (5 - answerQuality) * 0.02)),
		);

		// Jeśli odpowiedź była zła, skróć interwał
		if (answerQuality < 3) {
			intervalDays = 1;
		}

		const nextReviewAt = new Date();
		nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

		return { nextReviewAt, easeFactor, intervalDays };
	}
}
