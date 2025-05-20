'use client';

import type { GenerationCandidateDto } from '@/types/types';

interface BulkSaveButtonProps {
	flashcards: GenerationCandidateDto[];
	generationId: string;
	onSave: () => void;
	isLoading?: boolean;
}

export function BulkSaveButton({
	flashcards,
	generationId,
	onSave,
	isLoading = false,
}: BulkSaveButtonProps) {
	const handleSave = async () => {
		try {
			const response = await fetch('/api/flashcards', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					flashcards: flashcards.map((flashcard) => ({
						front: flashcard.front,
						back: flashcard.back,
						generation_id: generationId,
					})),
				}),
			});

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas zapisywania fiszek');
			}

			onSave();
		} catch (error) {
			console.error('Błąd podczas zapisywania fiszek:', error);
			// TODO: Handle error properly (show toast/notification)
		}
	};

	return (
		<button
			onClick={handleSave}
			disabled={isLoading || flashcards.length === 0}
			className="action-button bulk-save-button"
		>
			{isLoading ? (
				<>
					<svg
						className="action-button-icon animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						width="20"
						height="20"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Zapisywanie...
				</>
			) : (
				<>
					<span className="action-button-icon">💾</span>
					Zapisz zaakceptowane
					<span className="bulk-save-counter">
						{flashcards.length}
					</span>
				</>
			)}
		</button>
	);
}
