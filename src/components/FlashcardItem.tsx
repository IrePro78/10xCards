'use client';

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, Check, Undo2 } from 'lucide-react';
import type { GenerationCandidateDto } from '@/types/types';

interface FlashcardItemProps {
	flashcard: GenerationCandidateDto;
	onReject: (flashcard: GenerationCandidateDto) => void;
	onAccept: (flashcard: GenerationCandidateDto) => void;
	onEdit: (flashcard: GenerationCandidateDto) => void;
	isAccepted?: boolean;
}

export function FlashcardItem({
	flashcard,
	onReject,
	onAccept,
	onEdit,
	isAccepted = false,
}: FlashcardItemProps) {
	return (
		<Card className="w-full">
			<div className="grid grid-cols-2 divide-x">
				<div>
					<CardHeader className="pb-2">
						<CardDescription className="text-foreground min-h-[80px] text-lg leading-relaxed font-medium tracking-tight">
							{flashcard.front}
						</CardDescription>
					</CardHeader>
				</div>
				<div>
					<CardHeader className="pb-2">
						<CardDescription className="text-muted-foreground min-h-[80px] text-base">
							{flashcard.back}
						</CardDescription>
					</CardHeader>
				</div>
			</div>
			<CardFooter className="flex justify-end gap-1 border-t">
				{isAccepted ? (
					<Button
						onClick={() => onReject(flashcard)}
						className="border-[1.5px] border-blue-600 font-medium text-blue-600 transition-transform hover:bg-blue-600/5 active:scale-95 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500/5"
					>
						<Undo2 className="h-4 w-4" />
					</Button>
				) : (
					<>
						<Button
							onClick={() => onReject(flashcard)}
							className="border-[1.5px] border-red-600 font-medium text-red-600 transition-transform hover:bg-red-600/5 active:scale-95 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500/5"
						>
							<X className="h-4 w-4" />
						</Button>
						<Button
							onClick={() => onEdit(flashcard)}
							className="border-[1.5px] border-blue-600 font-medium text-blue-600 transition-transform hover:bg-blue-600/5 active:scale-95 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500/5"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							onClick={() => onAccept(flashcard)}
							className="border-[1.5px] border-green-600 font-medium text-green-600 transition-transform hover:bg-green-600/5 active:scale-95 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500/5"
						>
							<Check className="h-4 w-4" />
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
}
