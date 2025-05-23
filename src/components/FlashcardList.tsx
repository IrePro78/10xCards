'use client';

import type { GenerationCandidateDto } from '@/types/types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardListProps {
	flashcards: GenerationCandidateDto[];
	onAccept: (flashcard: GenerationCandidateDto) => void;
	onEdit: (flashcard: GenerationCandidateDto) => void;
	onReject: (flashcard: GenerationCandidateDto) => void;
	isAccepted?: boolean;
}

export function FlashcardList({
	flashcards,
	onAccept,
	onEdit,
	onReject,
	isAccepted = false,
}: FlashcardListProps) {
	if (!flashcards.length) {
		return (
			<div className="text-muted-foreground py-8 text-center">
				Brak fiszek do wyświetlenia
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{flashcards.map((flashcard, index) => (
				<FlashcardItem
					key={`flashcard-${index}-${flashcard.front.substring(0, 10)}`}
					flashcard={flashcard}
					onAccept={onAccept}
					onEdit={onEdit}
					onReject={onReject}
					isAccepted={isAccepted}
				/>
			))}
		</div>
	);
}
