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

interface AIGenerationViewModel {
	sourceText: string;
	candidateFlashcards: GenerationCandidateDto[];
	acceptedFlashcards: GenerationCandidateDto[];
	isLoading: boolean;
	error: string | null;
	generationId: string | null;
}

export function AIGenerationView() {
	const [viewModel, setViewModel] = useState<AIGenerationViewModel>({
		sourceText: '',
		candidateFlashcards: [],
		acceptedFlashcards: [],
		isLoading: false,
		error: null,
		generationId: null,
	});

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
			}));

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
			setViewModel((prev) => ({
				...prev,
				candidateFlashcards: data.candidate_flashcards,
				generationId: data.id,
				isLoading: false,
			}));

			toast.success('Pomyślnie wygenerowano fiszki');
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
			}));
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
			<TextInputArea
				value={viewModel.sourceText}
				onChange={handleTextChange}
				disabled={viewModel.isLoading}
			/>

			{viewModel.error && (
				<div className="rounded-md bg-red-100 p-4 text-red-700">
					{viewModel.error}
				</div>
			)}

			<div className="flex flex-col gap-4 sm:flex-row">
				<GenerateButton
					onClick={handleGenerate}
					isLoading={viewModel.isLoading}
					isDisabled={
						viewModel.sourceText.length < 1000 ||
						viewModel.sourceText.length > 10000
					}
				/>

				{viewModel.generationId && (
					<BulkSaveButton
						flashcards={viewModel.acceptedFlashcards}
						generationId={viewModel.generationId}
						onSave={handleBulkSave}
						isLoading={isSaving}
					/>
				)}
			</div>

			{viewModel.isLoading ? (
				<SkeletonLoader />
			) : (
				<>
					{viewModel.candidateFlashcards.length > 0 && (
						<div className="space-y-2">
							<h2 className="text-lg font-semibold">
								Kandydaci na fiszki
							</h2>
							<FlashcardList
								flashcards={viewModel.candidateFlashcards}
								onAccept={handleAcceptFlashcard}
								onEdit={handleEditFlashcard}
								onReject={handleRejectFlashcard}
							/>
						</div>
					)}

					{viewModel.acceptedFlashcards.length > 0 && (
						<div className="space-y-2">
							<h2 className="text-lg font-semibold">
								Zaakceptowane fiszki
							</h2>
							<FlashcardList
								flashcards={viewModel.acceptedFlashcards}
								onAccept={handleAcceptFlashcard}
								onEdit={handleEditFlashcard}
								onReject={handleRejectFlashcard}
							/>
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
