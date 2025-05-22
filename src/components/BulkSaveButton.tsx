'use client';

import type { GenerationCandidateDto } from '@/types/types';

interface BulkSaveButtonProps {
	flashcards: GenerationCandidateDto[];
	generationId: string;
	onSave: () => void;
	isLoading?: boolean;
	isDisabled?: boolean;
	flashcardsCount: number;
}

export function BulkSaveButton({
	flashcards,
	generationId,
	onSave,
	isLoading = false,
	isDisabled = false,
	flashcardsCount,
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
			disabled={isLoading || isDisabled}
			className="inline-flex transform items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-green-200 hover:bg-green-50 active:translate-y-0.5 active:scale-95 active:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
			type="button"
		>
			{isLoading ? (
				<>
					<svg
						className="h-5 w-5 animate-spin text-green-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
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
					<span className="text-gray-600">Zapisywanie...</span>
				</>
			) : (
				<>
					<span className="text-green-400">✓</span>
					<span>Zapisz fiszki</span>
					{flashcardsCount > 0 && (
						<span className="ml-1.5 inline-flex h-5 items-center justify-center rounded-full bg-green-100 px-2 text-xs font-medium text-green-600">
							{flashcardsCount}
						</span>
					)}
				</>
			)}
		</button>
	);
}
