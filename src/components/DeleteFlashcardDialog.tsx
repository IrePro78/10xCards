'use client';

import { type FlashcardListDto } from '@/types/types';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteFlashcardDialogProps {
	flashcard: FlashcardListDto | null;
	isOpen: boolean;
	onClose: () => void;
	onDelete: (flashcard: FlashcardListDto) => void;
}

export function DeleteFlashcardDialog({
	flashcard,
	isOpen,
	onClose,
	onDelete,
}: DeleteFlashcardDialogProps) {
	if (!flashcard) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="rounded-xl border-[#DDDDDD] p-6 shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-[#222222]">
						Usuń fiszkę
					</DialogTitle>
				</DialogHeader>
				<div className="mt-6">
					<p className="text-[#717171]">
						Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie
						można cofnąć.
					</p>
					<div className="mt-6 space-y-4">
						<div className="space-y-2">
							<p className="text-[15px] font-medium text-[#222222]">
								Przód
							</p>
							<div className="min-h-[40px] w-full rounded-lg border border-[#DDDDDD] bg-[#F7F7F7] px-4 py-3">
								<p className="text-[15px] text-[#222222]">
									{flashcard.front}
								</p>
							</div>
						</div>
						<div className="space-y-2">
							<p className="text-[15px] font-medium text-[#222222]">
								Tył
							</p>
							<div className="min-h-[80px] w-full rounded-lg border border-[#DDDDDD] bg-[#F7F7F7] px-4 py-3">
								<p className="text-[15px] text-[#717171]">
									{flashcard.back}
								</p>
							</div>
						</div>
					</div>
				</div>
				<DialogFooter className="mt-8 flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={onClose}
						className="h-10 min-w-[100px] rounded-lg border-[#222222] bg-white text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
					>
						Anuluj
					</Button>
					<Button
						variant="outline"
						onClick={() => onDelete(flashcard)}
						className="h-10 min-w-[100px] rounded-lg border-[#FF385C] bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98]"
					>
						Usuń
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
