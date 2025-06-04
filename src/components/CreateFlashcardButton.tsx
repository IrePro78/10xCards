'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateFlashcardButtonProps {
	onClick: () => void;
}

export function CreateFlashcardButton({
	onClick,
}: CreateFlashcardButtonProps) {
	return (
		<Button
			onClick={onClick}
			className="group relative rounded-lg border-[1.5px] border-[#717171] bg-white px-6 py-2 font-medium text-[#717171] transition-all duration-200 hover:scale-[1.02] hover:bg-[#717171]/5 active:scale-[0.98] disabled:border-[#717171]/40 disabled:text-[#717171]/40 disabled:hover:bg-white dark:border-[#717171] dark:bg-transparent dark:text-[#717171] dark:hover:bg-[#717171]/10"
		>
			<div className="flex items-center justify-center">
				<Plus className="mr-2 h-4 w-4" />
				<span>Dodaj fiszkę</span>
			</div>
		</Button>
	);
}
