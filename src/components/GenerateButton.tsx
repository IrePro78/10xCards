'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

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
			className="group relative rounded-lg border-[1.5px] border-[#222222] bg-[#222222] px-6 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-black hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-[#222222] dark:hover:border-[#f5f5f5] dark:hover:bg-[#f5f5f5]"
		>
			<div className="flex items-center justify-center">
				{isLoading ? (
					<>
						<Sparkles className="mr-2 h-4 w-4 text-[#FF385C] transition-all duration-300" />
						<span className="animate-pulse transition-all duration-300">
							Generowanie...
						</span>
					</>
				) : (
					<>
						<Sparkles className="mr-2 h-4 w-4 animate-[wiggle_1s_ease-in-out_infinite] transition-all duration-300" />
						<span className="transition-all duration-300">
							Generuj fiszki
						</span>
					</>
				)}
			</div>
		</Button>
	);
}
