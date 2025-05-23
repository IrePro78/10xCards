'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
	onClick: () => void;
	isLoading: boolean;
	isDisabled: boolean;
}

export function GenerateButton({
	onClick,
	isLoading,
	isDisabled,
}: GenerateButtonProps) {
	return (
		<Button
			onClick={onClick}
			disabled={isLoading || isDisabled}
			className="border-[1.5px] border-indigo-600 font-medium text-indigo-600 transition-transform hover:bg-indigo-600/10 active:scale-95 dark:border-indigo-500 dark:text-indigo-500 dark:hover:bg-indigo-500/10"
		>
			{isLoading ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<Sparkles className="mr-2 h-4 w-4" />
			)}
			{isLoading ? 'Generowanie...' : 'Generuj fiszki'}
		</Button>
	);
}
