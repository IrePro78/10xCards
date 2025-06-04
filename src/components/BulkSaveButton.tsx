'use client';

import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface BulkSaveButtonProps {
	onSave: () => Promise<void>;
	isLoading: boolean;
	flashcardsCount: number;
}

export function BulkSaveButton({
	onSave,
	isLoading,
	flashcardsCount,
}: BulkSaveButtonProps) {
	const getFlashcardsLabel = (count: number) => {
		if (count === 1) return 'fiszkę';
		if (count >= 2 && count <= 4) return 'fiszki';
		return 'fiszek';
	};

	return (
		<Button
			onClick={onSave}
			disabled={isLoading}
			className="group relative rounded-lg border-[1.5px] border-[#00A699] bg-white px-6 py-2 font-medium text-[#00A699] transition-all duration-300 hover:scale-[1.02] hover:bg-[#00A699]/5 active:scale-[0.98] disabled:border-[#00A699]/40 disabled:text-[#00A699]/40 disabled:hover:bg-white dark:border-[#00A699] dark:bg-transparent dark:text-[#00A699] dark:hover:bg-[#00A699]/10"
		>
			<Save className="mr-2 h-4 w-4" />
			{isLoading
				? 'Zapisywanie...'
				: `Zapisz ${flashcardsCount} ${getFlashcardsLabel(flashcardsCount)}`}
		</Button>
	);
}
