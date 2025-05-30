'use client';

import type {
	GenerationCandidateDto,
	FlashcardListDto,
} from '@/types/types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardListProps {
	flashcards: (GenerationCandidateDto | FlashcardListDto)[];
	onAccept?: (flashcard: GenerationCandidateDto) => void;
	onEdit?: (
		flashcard: GenerationCandidateDto | FlashcardListDto,
	) => void;
	onReject?: (flashcard: GenerationCandidateDto) => void;
	onDelete?: (flashcard: FlashcardListDto) => void;
	isAccepted?: boolean;
	mode?: 'generation' | 'list';
}

export function FlashcardList({
	flashcards,
	onAccept,
	onEdit,
	onReject,
	onDelete,
	isAccepted = false,
	mode = 'generation',
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
					onDelete={onDelete}
					isAccepted={isAccepted}
					mode={mode}
				/>
			))}
		</div>
	);
}
