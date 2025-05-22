'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { GenerationCandidateDto } from '@/types/types';
import { TextInputArea } from '@/components/TextInputArea';
import { GenerateButton } from '@/components/GenerateButton';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { FlashcardList } from '@/components/FlashcardList';
import { EditFlashcardDialog } from '@/components/EditFlashcardDialog';
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
				candidateFlashcards: [],
				acceptedFlashcards: [],
				generationId: null,
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

			// Symulujemy stopniowe pojawianie się fiszek
			for (let i = 0; i < totalFlashcards; i++) {
				await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms opóźnienia między fiszkami
				setViewModel((prev) => ({
					...prev,
					candidateFlashcards: [
						...prev.candidateFlashcards,
						data.candidate_flashcards[i],
					],
					currentFlashcard: i + 1,
					totalFlashcards,
					progress: Math.round(((i + 1) / totalFlashcards) * 100),
				}));
			}

			setViewModel((prev) => ({
				...prev,
				generationId: data.id,
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
		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.map((f) =>
				f === editingFlashcard ? editedFlashcard : f,
			),
			acceptedFlashcards: prev.acceptedFlashcards.map((f) =>
				f === editingFlashcard ? editedFlashcard : f,
			),
		}));
		setEditingFlashcard(null);
	};

	const handleRejectFlashcard = (
		flashcard: GenerationCandidateDto,
	) => {
		setViewModel((prev) => ({
			...prev,
			candidateFlashcards: prev.candidateFlashcards.filter(
				(f) => f !== flashcard,
			),
			acceptedFlashcards: prev.acceptedFlashcards.filter(
				(f) => f !== flashcard,
			),
		}));
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
				candidateFlashcards: [],
				acceptedFlashcards: [],
				sourceText: '',
				generationId: null,
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
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
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

					<div className="flex flex-col gap-4 sm:flex-row">
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

			{viewModel.isLoading ? (
				<SkeletonLoader />
			) : (
				<>
					{viewModel.candidateFlashcards.length > 0 && (
						<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
							<div className="border-b border-gray-100 px-6 py-4">
								<h2 className="text-lg font-medium text-gray-700">
									Kandydaci na fiszki
								</h2>
							</div>
							<div className="p-6">
								<FlashcardList
									flashcards={viewModel.candidateFlashcards}
									onAccept={handleAcceptFlashcard}
									onEdit={handleEditFlashcard}
									onReject={handleRejectFlashcard}
								/>
							</div>
						</div>
					)}

					{viewModel.acceptedFlashcards.length > 0 && (
						<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
							<div className="border-b border-gray-100 px-6 py-4">
								<h2 className="text-lg font-medium text-gray-700">
									Zaakceptowane fiszki
								</h2>
							</div>
							<div className="p-6">
								<FlashcardList
									flashcards={viewModel.acceptedFlashcards}
									onAccept={handleAcceptFlashcard}
									onEdit={handleEditFlashcard}
									onReject={handleRejectFlashcard}
								/>
							</div>
						</div>
					)}
				</>
			)}

			<EditFlashcardDialog
				flashcard={editingFlashcard}
				isOpen={editingFlashcard !== null}
				onClose={() => setEditingFlashcard(null)}
				onSave={handleSaveEdit}
			/>
		</div>
	);
}
