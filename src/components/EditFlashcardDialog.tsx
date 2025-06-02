'use client';

import { useState, useEffect } from 'react';
import { type FlashcardListDto } from '@/types/types';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditFlashcardDialogProps {
	flashcard: FlashcardListDto | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (flashcard: FlashcardListDto) => void;
}

export function EditFlashcardDialog({
	flashcard,
	isOpen,
	onClose,
	onSave,
}: EditFlashcardDialogProps) {
	const [editedFlashcard, setEditedFlashcard] =
		useState<FlashcardListDto | null>(null);

	useEffect(() => {
		setEditedFlashcard(flashcard);
	}, [flashcard]);

	if (!editedFlashcard) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="border-input rounded-xl p-6 shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-card-foreground text-xl font-semibold">
						Edytuj fiszkę
					</DialogTitle>
				</DialogHeader>
				<div className="mt-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="front"
								className="text-card-foreground font-medium"
							>
								Przód
							</Label>
							<Input
								id="front"
								value={editedFlashcard.front}
								onChange={(e) =>
									setEditedFlashcard({
										...editedFlashcard,
										front: e.target.value,
									})
								}
								placeholder="Wpisz pytanie lub termin..."
								className="border-input bg-card text-card-foreground hover:border-muted focus:border-ring h-10 rounded-lg text-[15px] transition-all focus:ring-0"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="back"
								className="text-card-foreground font-medium"
							>
								Tył
							</Label>
							<Textarea
								id="back"
								value={editedFlashcard.back}
								onChange={(e) =>
									setEditedFlashcard({
										...editedFlashcard,
										back: e.target.value,
									})
								}
								placeholder="Wpisz odpowiedź lub definicję..."
								className="border-input bg-card text-card-foreground hover:border-muted focus:border-ring min-h-[100px] rounded-lg text-[15px] transition-all focus:ring-0"
							/>
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
						onClick={() => onSave(editedFlashcard)}
						className="h-10 min-w-[100px] rounded-lg border-[#FF385C] bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98]"
					>
						Zapisz
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
