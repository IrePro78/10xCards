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
		<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
			<div className="divide-y divide-gray-100">
				<div className="p-4">
					<h3 className="mb-2 text-sm font-medium text-gray-500">
						Przód fiszki
					</h3>
					<div className="rounded-md bg-gray-50 p-3 text-sm text-gray-900">
						{flashcard.front}
					</div>
				</div>
				<div className="p-4">
					<h3 className="mb-2 text-sm font-medium text-gray-500">
						Tył fiszki
					</h3>
					<div className="rounded-md bg-gray-50 p-3 text-sm text-gray-900">
						{flashcard.back}
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3">
				<button
					className="inline-flex transform items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-red-200 hover:bg-red-50 active:translate-y-0.5 active:scale-95 active:bg-red-100"
					onClick={() => onReject(flashcard)}
					type="button"
				>
					<span className="text-red-400">✕</span>
					Odrzuć
				</button>
				<button
					className="inline-flex transform items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0.5 active:scale-95 active:bg-blue-100"
					onClick={() => onEdit(flashcard)}
					type="button"
				>
					<span className="text-blue-400">✎</span>
					Edytuj
				</button>
				<button
					className="inline-flex transform items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-green-200 hover:bg-green-50 active:translate-y-0.5 active:scale-95 active:bg-green-100"
					onClick={() => onAccept(flashcard)}
					type="button"
				>
					<span className="text-green-400">✓</span>
					Akceptuj
				</button>
			</div>
		</div>
	);
}
