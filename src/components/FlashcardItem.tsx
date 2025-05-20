'use client';

import type { GenerationCandidateDto } from '@/types/types';

interface FlashcardItemProps {
	flashcard: GenerationCandidateDto;
	onAccept: (flashcard: GenerationCandidateDto) => void;
	onEdit: (flashcard: GenerationCandidateDto) => void;
	onReject: (flashcard: GenerationCandidateDto) => void;
}

export function FlashcardItem({
	flashcard,
	onAccept,
	onEdit,
	onReject,
}: FlashcardItemProps) {
	return (
		<div className="flashcard-item">
			<div className="flashcard-content">
				<div>
					<h3 className="text-muted-foreground mb-2 text-sm font-medium">
						Przód fiszki
					</h3>
					<div className="flashcard-front">{flashcard.front}</div>
				</div>
				<div>
					<h3 className="text-muted-foreground mb-2 text-sm font-medium">
						Tył fiszki
					</h3>
					<div className="flashcard-back">{flashcard.back}</div>
				</div>
			</div>

			<div className="flashcard-actions">
				<button
					className="action-button reject-button"
					onClick={() => onReject(flashcard)}
				>
					<span className="action-button-icon">✕</span>
					Odrzuć
				</button>
				<button
					className="action-button edit-button"
					onClick={() => onEdit(flashcard)}
				>
					<span className="action-button-icon">✎</span>
					Edytuj
				</button>
				<button
					className="action-button accept-button"
					onClick={() => onAccept(flashcard)}
				>
					<span className="action-button-icon">✓</span>
					Akceptuj
				</button>
			</div>
		</div>
	);
}
