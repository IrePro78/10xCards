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
			className="group relative rounded-lg border-[1.5px] border-[#FF385C] bg-white px-6 py-2 font-medium text-[#FF385C] transition-all duration-300 hover:scale-[1.02] hover:bg-[#FF385C]/5 active:scale-[0.98] disabled:border-[#FF385C]/40 disabled:text-[#FF385C]/40 disabled:hover:bg-white dark:border-[#FF385C] dark:bg-transparent dark:text-[#FF385C] dark:hover:bg-[#FF385C]/10"
		>
			<div className="flex items-center justify-center">
				{isLoading ? (
					<>
						<Sparkles className="mr-2 h-4 w-4 animate-spin" />
						<span className="animate-pulse">Generowanie...</span>
					</>
				) : (
					<>
						<Sparkles className="mr-2 h-4 w-4 animate-[wiggle_1s_ease-in-out_infinite]" />
						<span className="transition-all duration-300">
							Generuj fiszki
						</span>
					</>
				)}
			</div>
		</Button>
	);
}
