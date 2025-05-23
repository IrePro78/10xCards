'use client';

import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { GenerationCandidateDto } from '@/types/types';

interface BulkSaveButtonProps {
	flashcards: GenerationCandidateDto[];
	generationId: string;
	onSave: () => Promise<void>;
	isLoading: boolean;
	flashcardsCount: number;
}

export function BulkSaveButton({
	flashcards,
	generationId,
	onSave,
	isLoading,
	flashcardsCount,
}: BulkSaveButtonProps) {
	if (!flashcards.length || !generationId) {
		return null;
	}

	const getFlashcardsLabel = (count: number) => {
		if (count === 1) return 'fiszkę';
		if (count >= 2 && count <= 4) return 'fiszki';
		return 'fiszek';
	};

	return (
		<Button
			onClick={onSave}
			disabled={isLoading}
			className="border-[1.5px] border-green-600 font-medium text-green-600 transition-transform hover:bg-green-600/10 active:scale-95 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500/10"
		>
			<Save className="mr-2 h-4 w-4" />
			{isLoading
				? 'Zapisywanie...'
				: `Zapisz ${flashcardsCount} ${getFlashcardsLabel(flashcardsCount)}`}
		</Button>
	);
}
