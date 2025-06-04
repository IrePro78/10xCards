'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, Check, Trash2, RotateCcw } from 'lucide-react';
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
		<Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
			<CardContent className="p-6">
				<div className="space-y-4">
					<div>
						<h3 className="text-foreground mb-1 line-clamp-2 min-h-[3.5rem] text-lg leading-relaxed font-medium">
							{flashcard.front}
						</h3>
						<div className="text-muted-foreground mt-2 line-clamp-3 min-h-[4.5rem] text-base hover:line-clamp-none">
							{flashcard.back}
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-6 py-3">
				{isGenerationMode && isAccepted && onReject && (
					<Button
						variant="outline"
						size="icon"
						onClick={() =>
							onReject(flashcard as GenerationCandidateDto)
						}
						className="bg-background dark:bg-background h-8 w-8 rounded-full border-[1.5px] border-[#484848] text-[#484848] transition-all duration-200 hover:scale-[1.02] hover:border-[#484848] hover:bg-[#484848]/10 active:scale-[0.98]"
					>
						<RotateCcw className="h-4 w-4" />
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
								className="bg-background dark:bg-background h-8 w-8 rounded-full border-[1.5px] border-[#FF385C] text-[#FF385C] transition-all duration-200 hover:scale-[1.02] hover:border-[#FF385C] hover:bg-[#FF385C]/10 active:scale-[0.98]"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
						{onEdit && (
							<Button
								variant="outline"
								size="icon"
								onClick={() => onEdit(flashcard)}
								className="bg-background dark:bg-background h-8 w-8 rounded-lg border-[1.5px] border-[#484848] text-[#484848] transition-all duration-200 hover:scale-[1.02] hover:border-[#484848] hover:bg-[#484848]/10 active:scale-[0.98]"
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
								className="bg-background dark:bg-background h-8 w-8 rounded-lg border-[1.5px] border-[#00A699] text-[#00A699] transition-all duration-200 hover:scale-[1.02] hover:border-[#00A699] hover:bg-[#00A699]/10 active:scale-[0.98]"
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
								className="bg-background dark:bg-background h-8 w-8 rounded-lg border-[1.5px] border-[#484848] text-[#484848] transition-all duration-200 hover:scale-[1.02] hover:border-[#484848] hover:bg-[#484848]/10 active:scale-[0.98]"
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
								className="bg-background dark:bg-background h-8 w-8 rounded-lg border-[1.5px] border-[#FF385C] text-[#FF385C] transition-all duration-200 hover:scale-[1.02] hover:border-[#FF385C] hover:bg-[#FF385C]/10 active:scale-[0.98]"
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
