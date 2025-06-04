'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type {
	GenerationCandidateDto,
	FlashcardListDto,
} from '@/types/types';
import { TextInputArea } from '@/components/TextInputArea';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { FlashcardList } from '@/components/FlashcardList';
import { EditFlashcardDialog } from '@/components/EditFlashcardDialog';
import { DeleteFlashcardDialog } from '@/components/DeleteFlashcardDialog';
import { CreateFlashcardDialog } from '@/components/CreateFlashcardDialog';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Sparkles, Plus } from 'lucide-react';

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
	const [isCreatingFlashcard, setIsCreatingFlashcard] =
		useState(false);
	const [editingFlashcard, setEditingFlashcard] =
		useState<FlashcardListDto | null>(null);
	const [deletingFlashcard, setDeletingFlashcard] =
		useState<FlashcardListDto | null>(null);
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
		const flashcardForEdit: FlashcardListDto = {
			id: 'temp-' + Date.now(), // Tymczasowe ID dla edycji
			front: flashcard.front,
			back: flashcard.back,
			source: 'ai',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setEditingFlashcard(flashcardForEdit);
	};

	const handleSaveEdit = (editedFlashcard: FlashcardListDto) => {
		if (!editingFlashcard) return;

		// Sprawdzamy, czy faktycznie dokonano zmian w treści
		const wasActuallyEdited =
			editingFlashcard.front !== editedFlashcard.front ||
			editingFlashcard.back !== editedFlashcard.back;

		// Przygotowujemy zaktualizowaną fiszkę
		const updatedFlashcard: GenerationCandidateDto = {
			front: editedFlashcard.front,
			back: editedFlashcard.back,
			isEdited: wasActuallyEdited,
		};

		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.map((f) =>
				f.front === editingFlashcard.front &&
				f.back === editingFlashcard.back
					? updatedFlashcard
					: f,
			),
			acceptedFlashcards: prev.acceptedFlashcards.map((f) =>
				f.front === editingFlashcard.front &&
				f.back === editingFlashcard.back
					? updatedFlashcard
					: f,
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
			handleDeleteFlashcard(flashcard);
		}
	};

	const handleDeleteFlashcard = (
		flashcard: GenerationCandidateDto,
	) => {
		const flashcardForDelete: FlashcardListDto = {
			id: 'temp-' + Date.now(), // Tymczasowe ID dla usuwania
			front: flashcard.front,
			back: flashcard.back,
			source: 'ai',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setDeletingFlashcard(flashcardForDelete);
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
							source: flashcard.isEdited
								? 'ai-edited'
								: viewModel.generationId
									? 'ai'
									: 'manual',
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

	const handleCreateFlashcard = (
		flashcard: GenerationCandidateDto,
	) => {
		setViewModel((prev) => ({
			...prev,
			acceptedFlashcards: [
				...prev.acceptedFlashcards,
				{
					...flashcard,
					isEdited: false,
				},
			],
		}));
		setIsCreatingFlashcard(false);
		toast.success('Fiszka została utworzona');
	};

	return (
		<div className="bg-background space-y-6 rounded-xl p-6">
			<div className="border-border rounded-xl border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-foreground text-lg font-medium">
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
						<div className="bg-destructive/10 text-destructive mt-4 rounded-lg p-4">
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
						<Button
							onClick={handleGenerate}
							disabled={
								viewModel.sourceText.length < 1000 ||
								viewModel.sourceText.length > 10000 ||
								viewModel.isLoading
							}
							className="rounded-lg border-[1.5px] border-[#222222] bg-[#FF385C] px-6 py-2 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-[#E31C5F] hover:bg-[#E31C5F] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
						>
							{viewModel.isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span className="animate-pulse">
										Generowanie...
									</span>
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4 animate-[wiggle_1s_ease-in-out_infinite]" />
									Generuj fiszki
								</>
							)}
						</Button>

						<Button
							onClick={() => setIsCreatingFlashcard(true)}
							className="rounded-lg border-[1.5px] border-[#222222] bg-[#222222] px-6 py-2 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-black hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-[#222222] dark:hover:border-[#f5f5f5] dark:hover:bg-[#f5f5f5]"
						>
							<Plus className="mr-2 h-4 w-4" />
							Dodaj fiszkę
						</Button>

						{viewModel.acceptedFlashcards.length > 0 && (
							<Button
								onClick={handleBulkSave}
								disabled={isSaving}
								className="rounded-lg border-[1.5px] border-[#222222] bg-[#222222] px-6 py-2 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-black hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-[#222222] dark:hover:border-[#f5f5f5] dark:hover:bg-[#f5f5f5]"
							>
								{isSaving ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span className="animate-pulse">
											Zapisywanie...
										</span>
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4 animate-bounce" />
										Zapisz {viewModel.acceptedFlashcards.length}{' '}
										{viewModel.acceptedFlashcards.length === 1
											? 'fiszkę'
											: viewModel.acceptedFlashcards.length < 5
												? 'fiszki'
												: 'fiszek'}
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</div>

			{viewModel.isLoading && (
				<div className="border-border rounded-xl border shadow-sm">
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
					<div className="flashcard-container rounded-xl border shadow-sm">
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
					<div className="flashcard-container rounded-xl border shadow-sm">
						<div className="border-border border-b px-6 py-4">
							<h2 className="text-lg font-medium">
								Zaakceptowane fiszki
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Lista zaakceptowanych fiszek
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

			<CreateFlashcardDialog
				isOpen={isCreatingFlashcard}
				onClose={() => setIsCreatingFlashcard(false)}
				onCreate={handleCreateFlashcard}
			/>
		</div>
	);
}
