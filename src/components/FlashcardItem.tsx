'use client';

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, Check, Trash2, Undo2 } from 'lucide-react';
import type {
	GenerationCandidateDto,
	FlashcardListDto,
} from '@/types/types';

interface FlashcardItemProps {
	flashcard: GenerationCandidateDto | FlashcardListDto;
	onReject?: (flashcard: GenerationCandidateDto) => void;
	onAccept?: (flashcard: GenerationCandidateDto) => void;
	onEdit?: (
		flashcard: GenerationCandidateDto | FlashcardListDto,
	) => void;
	onDelete?: (flashcard: FlashcardListDto) => void;
	isAccepted?: boolean;
	mode?: 'generation' | 'list';
}

export function FlashcardItem({
	flashcard,
	onReject,
	onAccept,
	onEdit,
	onDelete,
	isAccepted = false,
	mode = 'generation',
}: FlashcardItemProps) {
	const isGenerationMode = mode === 'generation';
	const isListMode = mode === 'list';

	return (
		<Card className="bg-card">
			<div className="divide-border grid grid-cols-2 divide-x">
				<div>
					<CardHeader>
						<CardDescription className="text-card-foreground min-h-[80px] text-lg leading-relaxed font-medium tracking-tight">
							{flashcard.front}
						</CardDescription>
					</CardHeader>
				</div>
				<div>
					<CardHeader>
						<CardDescription className="text-muted-foreground min-h-[80px] text-base">
							{flashcard.back}
						</CardDescription>
					</CardHeader>
				</div>
			</div>
			<CardFooter className="border-border flex justify-end gap-2 border-t p-3">
				{isGenerationMode && isAccepted && onReject && (
					<Button
						variant="outline"
						size="icon"
						onClick={() =>
							onReject(flashcard as GenerationCandidateDto)
						}
						className="h-8 w-8 rounded-full border-[1.5px] border-[#222222] bg-white text-[#222222] transition-all duration-200 hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
					>
						<Undo2 className="h-4 w-4" />
					</Button>
				)}
				{isGenerationMode && !isAccepted && (
					<>
						{onReject && (
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									onReject(flashcard as GenerationCandidateDto)
								}
								className="h-8 w-8 rounded-full border-[1.5px] border-[#222222] bg-white text-[#FF385C] transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFF8F9] active:scale-[0.98]"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
						{onEdit && (
							<Button
								variant="outline"
								size="icon"
								onClick={() => onEdit(flashcard)}
								className="h-8 w-8 rounded-lg border-[1.5px] border-[#222222] bg-white text-[#222222] transition-all duration-200 hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
						{onAccept && (
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									onAccept(flashcard as GenerationCandidateDto)
								}
								className="h-8 w-8 rounded-lg border-[1.5px] border-[#222222] bg-[#FF385C] text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98]"
							>
								<Check className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
				{isListMode && (
					<>
						{onEdit && (
							<Button
								variant="outline"
								size="icon"
								onClick={() => onEdit(flashcard)}
								className="h-8 w-8 rounded-lg border-[1.5px] border-[#222222] bg-white text-[#222222] transition-all duration-200 hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									onDelete(flashcard as FlashcardListDto)
								}
								className="h-8 w-8 rounded-lg border-[1.5px] border-[#FF385C] bg-white text-[#FF385C] transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFF8F9] active:scale-[0.98]"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</CardFooter>
		</Card>
	);
}
