'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { GenerationCandidateDto } from '@/types/types';
import { TextInputArea } from '@/components/TextInputArea';
import { GenerateButton } from '@/components/GenerateButton';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { FlashcardList } from '@/components/FlashcardList';
import { EditFlashcardDialog } from '@/components/EditFlashcardDialog';
import { DeleteFlashcardDialog } from '@/components/DeleteFlashcardDialog';
import { BulkSaveButton } from '@/components/BulkSaveButton';
import { ProgressBar } from '@/components/ProgressBar';

interface AIGenerationViewModel {
	sourceText: string;
	candidateFlashcards: GenerationCandidateDto[];
	acceptedFlashcards: GenerationCandidateDto[];
	isLoading: boolean;
	error: string | null;
	generationId: string | null;
	progress: number;
	totalFlashcards: number;
	currentFlashcard: number;
}

export function AIGenerationView() {
	const [viewModel, setViewModel] = useState<AIGenerationViewModel>({
		sourceText: '',
		candidateFlashcards: [],
		acceptedFlashcards: [],
		isLoading: false,
		error: null,
		generationId: null,
		progress: 0,
		totalFlashcards: 0,
		currentFlashcard: 0,
	});

	const [showProgress, setShowProgress] = useState(false);

	const [editingFlashcard, setEditingFlashcard] =
		useState<GenerationCandidateDto | null>(null);
	const [deletingFlashcard, setDeletingFlashcard] =
		useState<GenerationCandidateDto | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const handleTextChange = (text: string) => {
		setViewModel((prev) => ({
			...prev,
			sourceText: text,
			error: null,
		}));
	};

	const handleGenerate = async () => {
		try {
			setViewModel((prev) => ({
				...prev,
				isLoading: true,
				error: null,
				progress: 0,
				totalFlashcards: 0,
				currentFlashcard: 0,
			}));
			setShowProgress(true);

			const response = await fetch('/api/generations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ source_text: viewModel.sourceText }),
			});

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas generowania fiszek');
			}

			const data = await response.json();
			const totalFlashcards = data.candidate_flashcards.length;

			// Ustawiamy od razu liczbę całkowitą fiszek
			setViewModel((prev) => ({
				...prev,
				totalFlashcards,
				generationId: data.id,
				// Dodajemy nowe fiszki od razu do istniejących
				candidateFlashcards: [
					...prev.candidateFlashcards,
					...data.candidate_flashcards,
				],
			}));

			// Symulujemy stopniowe pojawianie się fiszek
			const addFlashcardsWithAnimation = async () => {
				// Całkowity czas animacji
				const totalAnimationTime = 5000; // 5 sekund na całą animację

				// Obliczamy dokładnie, przy jakich wartościach procentowych mają pojawiać się fiszki
				// Każda fiszka dostaje równą część paska postępu
				const flashcardsThresholds = [];
				for (let i = 0; i < totalFlashcards; i++) {
					// Równomiernie rozkładamy fiszki między 10% a 90% paska
					// Pierwsza fiszka przy 10%, ostatnia przy 90%
					const threshold = Math.round(
						10 + (i * 80) / (totalFlashcards - 1),
					);
					flashcardsThresholds.push(threshold);
				}

				// Czas na 1% postępu
				const incrementTime = totalAnimationTime / 100;

				// Animujemy tylko postęp
				for (let percent = 1; percent <= 100; percent++) {
					await new Promise((resolve) =>
						setTimeout(resolve, incrementTime),
					);

					// Sprawdzamy, ile fiszek powinno być widocznych przy obecnym procencie
					const newFlashcardsCount = flashcardsThresholds.filter(
						(threshold) => percent >= threshold,
					).length;

					setViewModel((prev) => ({
						...prev,
						currentFlashcard: newFlashcardsCount,
						progress: percent,
					}));
				}

				// Po zakończeniu animacji
				setViewModel((prev) => ({
					...prev,
					isLoading: false,
				}));

				// Czekamy na zakończenie ostatniej animacji przed pokazaniem komunikatu
				await new Promise((resolve) => setTimeout(resolve, 500));

				toast.success(
					`Pomyślnie wygenerowano ${totalFlashcards} ${totalFlashcards === 1 ? 'fiszkę' : totalFlashcards < 5 ? 'fiszki' : 'fiszek'}`,
				);

				// Dajemy czas na zobaczenie 100% i dopiero potem ukrywamy
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setShowProgress(false);
			};

			await addFlashcardsWithAnimation();
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			toast.error(errorMessage);
			setViewModel((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
				progress: 0,
				totalFlashcards: 0,
				currentFlashcard: 0,
			}));
			setShowProgress(false);
		}
	};

	const handleAcceptFlashcard = (
		flashcard: GenerationCandidateDto,
	) => {
		// Sprawdzamy czy fiszka nie jest już na liście zaakceptowanych
		if (viewModel.acceptedFlashcards.some((f) => f === flashcard)) {
			return;
		}

		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.filter(
				(f) => f !== flashcard,
			),
			acceptedFlashcards: [...prev.acceptedFlashcards, flashcard],
		}));
	};

	const handleEditFlashcard = (flashcard: GenerationCandidateDto) => {
		setEditingFlashcard(flashcard);
	};

	const handleSaveEdit = (
		editedFlashcard: GenerationCandidateDto,
	) => {
		// Sprawdzamy, czy faktycznie dokonano zmian w treści
		const wasActuallyEdited =
			editingFlashcard &&
			(editingFlashcard.front !== editedFlashcard.front ||
				editingFlashcard.back !== editedFlashcard.back);

		// Przygotowujemy zaktualizowaną fiszkę
		const updatedFlashcard = {
			...editedFlashcard,
			isEdited: wasActuallyEdited ? true : editingFlashcard?.isEdited,
		};

		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.map((f) =>
				f === editingFlashcard ? updatedFlashcard : f,
			),
			acceptedFlashcards: prev.acceptedFlashcards.map((f) =>
				f === editingFlashcard ? updatedFlashcard : f,
			),
		}));
		setEditingFlashcard(null);
	};

	const handleRejectFlashcard = (
		flashcard: GenerationCandidateDto,
	) => {
		// Jeśli fiszka jest w liście zaakceptowanych, przenosimy ją z powrotem do kandydatów
		if (viewModel.acceptedFlashcards.some((f) => f === flashcard)) {
			setViewModel((prev) => ({
				...prev,
				candidateFlashcards: [...prev.candidateFlashcards, flashcard],
				acceptedFlashcards: prev.acceptedFlashcards.filter(
					(f) => f !== flashcard,
				),
			}));
		} else {
			// Jeśli fiszka jest w liście kandydatów, pokazujemy modal potwierdzenia
			setDeletingFlashcard(flashcard);
		}
	};

	const handleConfirmDelete = (flashcard: GenerationCandidateDto) => {
		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.filter(
				(f) => f !== flashcard,
			),
			acceptedFlashcards: prev.acceptedFlashcards.filter(
				(f) => f !== flashcard,
			),
		}));
		setDeletingFlashcard(null);
	};

	const handleBulkSave = async () => {
		try {
			setIsSaving(true);
			const response = await fetch('/api/flashcards', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					flashcards: viewModel.acceptedFlashcards.map(
						(flashcard) => ({
							front: flashcard.front,
							back: flashcard.back,
							source: flashcard.isEdited ? 'ai-edited' : 'ai',
							generation_id: viewModel.generationId,
						}),
					),
				}),
			});

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas zapisywania fiszek');
			}

			toast.success(
				`Pomyślnie zapisano ${viewModel.acceptedFlashcards.length} fiszek`,
			);

			setViewModel((prev) => ({
				...prev,
				acceptedFlashcards: [],
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			toast.error(errorMessage);
			console.error('Błąd podczas zapisywania fiszek:', error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="bg-background space-y-6 rounded-lg p-6">
			<div className="border-border rounded-lg border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-lg font-medium">
						Wprowadź tekst do analizy
					</h2>
				</div>
				<div className="p-6">
					<TextInputArea
						value={viewModel.sourceText}
						onChange={handleTextChange}
						disabled={viewModel.isLoading}
					/>

					{viewModel.error && (
						<div className="bg-destructive/10 text-destructive mt-4 rounded-md p-4">
							{viewModel.error}
						</div>
					)}

					<div className="mt-4 min-h-[40px]">
						<ProgressBar
							progress={viewModel.progress}
							currentFlashcard={viewModel.currentFlashcard}
							totalFlashcards={viewModel.totalFlashcards}
							isVisible={showProgress}
						/>
					</div>

					<div className="mt-6 flex flex-col gap-4 sm:flex-row">
						<GenerateButton
							onClick={handleGenerate}
							isLoading={viewModel.isLoading}
							isDisabled={
								viewModel.sourceText.length < 1000 ||
								viewModel.sourceText.length > 10000
							}
						/>

						{viewModel.generationId &&
							viewModel.acceptedFlashcards.length > 0 && (
								<BulkSaveButton
									flashcards={viewModel.acceptedFlashcards}
									generationId={viewModel.generationId}
									onSave={handleBulkSave}
									isLoading={isSaving}
									flashcardsCount={
										viewModel.acceptedFlashcards.length
									}
								/>
							)}
					</div>
				</div>
			</div>

			{viewModel.isLoading && (
				<div className="border-border rounded-lg border shadow-sm">
					<div className="border-border border-b px-6 py-4">
						<h2 className="text-lg font-medium">
							Generowanie fiszek
						</h2>
					</div>
					<div className="p-6">
						<SkeletonLoader />
					</div>
				</div>
			)}

			{!viewModel.isLoading &&
				viewModel.candidateFlashcards.length > 0 && (
					<div className="border-border rounded-lg border shadow-sm">
						<div className="border-border border-b px-6 py-4">
							<h2 className="text-lg font-medium">
								Kandydaci na fiszki
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Wybierz fiszki, które chcesz zachować
							</p>
						</div>
						<div className="p-6">
							<FlashcardList
								flashcards={viewModel.candidateFlashcards}
								onAccept={handleAcceptFlashcard}
								onEdit={handleEditFlashcard}
								onReject={handleRejectFlashcard}
								isAccepted={false}
							/>
						</div>
					</div>
				)}

			{!viewModel.isLoading &&
				viewModel.acceptedFlashcards.length > 0 && (
					<div className="border-border rounded-lg border shadow-sm">
						<div className="border-border border-b px-6 py-4">
							<h2 className="text-lg font-medium">
								Zaakceptowane fiszki
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Lista zaakceptowanych fiszek. Kliknij przycisk powrotu
								aby przenieść fiszkę z powrotem do kandydatów.
							</p>
						</div>
						<div className="p-6">
							<FlashcardList
								flashcards={viewModel.acceptedFlashcards}
								onAccept={handleAcceptFlashcard}
								onEdit={handleEditFlashcard}
								onReject={handleRejectFlashcard}
								isAccepted={true}
							/>
						</div>
					</div>
				)}

			<EditFlashcardDialog
				flashcard={editingFlashcard}
				isOpen={editingFlashcard !== null}
				onClose={() => setEditingFlashcard(null)}
				onSave={handleSaveEdit}
			/>

			<DeleteFlashcardDialog
				flashcard={deletingFlashcard}
				isOpen={deletingFlashcard !== null}
				onClose={() => setDeletingFlashcard(null)}
				onDelete={handleConfirmDelete}
			/>
		</div>
	);
}
