'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Database } from '@/db/database.types';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface ReviewSessionViewModel {
	cards: Flashcard[];
	currentCardIndex: number;
	isLoading: boolean;
	error: string | null;
	showAnswer: boolean;
	sessionId: string | null;
}

export function ReviewSessionView() {
	const [viewModel, setViewModel] = useState<ReviewSessionViewModel>({
		cards: [],
		currentCardIndex: 0,
		isLoading: false,
		error: null,
		showAnswer: false,
		sessionId: null,
	});

	const fetchCardsAndStartSession = async () => {
		try {
			setViewModel((prev) => ({
				...prev,
				isLoading: true,
				error: null,
			}));

			// Pobierz karty do powtórki
			const cardsResponse = await fetch('/api/review-sessions');
			if (!cardsResponse.ok) {
				throw new Error(
					'Wystąpił błąd podczas pobierania kart do powtórki',
				);
			}
			const cardsData = await cardsResponse.json();

			// Rozpocznij sesję
			const sessionResponse = await fetch('/api/review-sessions', {
				method: 'POST',
			});
			if (!sessionResponse.ok) {
				throw new Error('Wystąpił błąd podczas rozpoczynania sesji');
			}
			const sessionData = await sessionResponse.json();

			setViewModel((prev) => ({
				...prev,
				cards: cardsData.cards,
				sessionId: sessionData.id,
				isLoading: false,
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			setViewModel((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
			}));
			toast.error(errorMessage);
		}
	};

	const handleShowAnswer = () => {
		setViewModel((prev) => ({
			...prev,
			showAnswer: true,
		}));
	};

	const handleAnswer = async (quality: number) => {
		try {
			if (!viewModel.sessionId) {
				throw new Error('Brak aktywnej sesji');
			}

			const currentCard = viewModel.cards[viewModel.currentCardIndex];
			if (!currentCard) {
				throw new Error('Brak aktualnej karty');
			}

			// Zapisz odpowiedź
			const response = await fetch(
				`/api/review-sessions/${viewModel.sessionId}/answers`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						flashcard_id: currentCard.id,
						quality,
						response_time_ms: 0, // TODO: Dodać pomiar czasu odpowiedzi
					}),
				},
			);

			if (!response.ok) {
				throw new Error(
					'Wystąpił błąd podczas zapisywania odpowiedzi',
				);
			}

			// Jeśli to była ostatnia karta, zakończ sesję
			if (viewModel.currentCardIndex === viewModel.cards.length - 1) {
				const completeResponse = await fetch(
					`/api/review-sessions/${viewModel.sessionId}/complete`,
					{
						method: 'POST',
					},
				);

				if (!completeResponse.ok) {
					throw new Error('Wystąpił błąd podczas kończenia sesji');
				}

				toast.success('Sesja zakończona pomyślnie!');
			}

			// Przejdź do następnej karty
			setViewModel((prev) => ({
				...prev,
				currentCardIndex: prev.currentCardIndex + 1,
				showAnswer: false,
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			toast.error(errorMessage);
		}
	};

	useEffect(() => {
		fetchCardsAndStartSession();
	}, []);

	if (viewModel.isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF385C] border-t-transparent"></div>
			</div>
		);
	}

	if (viewModel.error) {
		return (
			<div className="rounded-lg bg-[#FFF8F9] p-4 text-[#FF385C]">
				{viewModel.error}
			</div>
		);
	}

	if (viewModel.cards.length === 0) {
		return (
			<div className="text-muted-foreground text-center">
				Brak kart do powtórki
			</div>
		);
	}

	if (viewModel.currentCardIndex >= viewModel.cards.length) {
		return (
			<div className="text-center">
				<h2 className="text-foreground text-xl font-semibold">
					Gratulacje!
				</h2>
				<p className="text-muted-foreground mt-2">
					Zakończyłeś wszystkie powtórki na dziś
				</p>
			</div>
		);
	}

	const currentCard = viewModel.cards[viewModel.currentCardIndex];
	const progress =
		((viewModel.currentCardIndex + 1) / viewModel.cards.length) * 100;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="text-muted-foreground text-sm">
					Karta {viewModel.currentCardIndex + 1} z{' '}
					{viewModel.cards.length}
				</div>
				<Progress value={progress} className="w-32" />
			</div>

			<Card className="overflow-hidden">
				<div className="border-b p-6">
					<div className="text-foreground text-lg">
						{currentCard.front}
					</div>
				</div>

				{viewModel.showAnswer ? (
					<div className="space-y-6 p-6">
						<div className="text-foreground text-lg">
							{currentCard.back}
						</div>
						<div className="flex justify-center gap-2">
							<Button
								onClick={() => handleAnswer(1)}
								className="rounded-lg border-[1.5px] border-[#222222] bg-red-500 px-4 text-white transition-all hover:scale-[1.02] hover:bg-red-600 active:scale-[0.98]"
							>
								Trudne
							</Button>
							<Button
								onClick={() => handleAnswer(3)}
								className="rounded-lg border-[1.5px] border-[#222222] bg-yellow-500 px-4 text-white transition-all hover:scale-[1.02] hover:bg-yellow-600 active:scale-[0.98]"
							>
								Średnie
							</Button>
							<Button
								onClick={() => handleAnswer(5)}
								className="rounded-lg border-[1.5px] border-[#222222] bg-green-500 px-4 text-white transition-all hover:scale-[1.02] hover:bg-green-600 active:scale-[0.98]"
							>
								Łatwe
							</Button>
						</div>
					</div>
				) : (
					<div className="flex justify-center p-6">
						<Button
							onClick={handleShowAnswer}
							className="rounded-lg border-[1.5px] border-[#222222] bg-[#FF385C] px-4 text-white transition-all hover:scale-[1.02] hover:bg-[#FF385C]/90 active:scale-[0.98]"
						>
							Pokaż odpowiedź
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
