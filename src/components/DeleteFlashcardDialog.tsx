'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GenerationCandidateDto } from '@/types/types';

interface DeleteFlashcardDialogProps {
	flashcard: GenerationCandidateDto | null;
	isOpen: boolean;
	onClose: () => void;
	onDelete: (flashcard: GenerationCandidateDto) => void;
}

export function DeleteFlashcardDialog({
	flashcard,
	isOpen,
	onClose,
	onDelete,
}: DeleteFlashcardDialogProps) {
	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/5 backdrop-blur-[2px]"
					aria-hidden="true"
				/>
			)}
			<Dialog
				open={isOpen}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogContent className="fixed top-[50%] left-[50%] flex translate-x-[-50%] translate-y-[-50%] flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold text-gray-900">
							Usuń fiszkę
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-2">
						<p className="text-xl font-semibold text-gray-900">
							Czy na pewno chcesz usunąć tę fiszkę?
						</p>
						<p className="text-gray-600">
							Tej operacji nie można cofnąć.
						</p>
					</div>

					<DialogFooter className="flex justify-end gap-2 border-t border-gray-200 pt-6">
						<Button onClick={onClose} variant="outline-info">
							Anuluj
						</Button>
						<Button
							onClick={() => flashcard && onDelete(flashcard)}
							variant="outline-destructive"
						>
							Usuń
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
