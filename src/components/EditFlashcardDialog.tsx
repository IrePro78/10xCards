'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { GenerationCandidateDto } from '@/types';

interface EditFlashcardDialogProps {
	flashcard: GenerationCandidateDto | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (flashcard: GenerationCandidateDto) => void;
}

interface ValidationErrors {
	front?: string;
	back?: string;
}

export function EditFlashcardDialog({
	flashcard,
	isOpen,
	onClose,
	onSave,
}: EditFlashcardDialogProps) {
	const [editedFlashcard, setEditedFlashcard] =
		useState<GenerationCandidateDto | null>(flashcard);
	const [errors, setErrors] = useState<ValidationErrors>({});

	// Reset form when flashcard changes
	if (flashcard !== editedFlashcard) {
		setEditedFlashcard(flashcard);
		setErrors({});
	}

	if (!editedFlashcard) return null;

	const validate = (): boolean => {
		const newErrors: ValidationErrors = {};

		if (editedFlashcard.front.length > 200) {
			newErrors.front =
				'Przód fiszki nie może być dłuższy niż 200 znaków';
		}

		if (editedFlashcard.back.length > 500) {
			newErrors.back =
				'Tył fiszki nie może być dłuższy niż 500 znaków';
		}

		if (editedFlashcard.front.trim().length === 0) {
			newErrors.front = 'Przód fiszki nie może być pusty';
		}

		if (editedFlashcard.back.trim().length === 0) {
			newErrors.back = 'Tył fiszki nie może być pusty';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (validate()) {
			onSave(editedFlashcard);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edycja fiszki</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="front">Przód fiszki</Label>
						<Textarea
							id="front"
							value={editedFlashcard.front}
							onChange={(e) =>
								setEditedFlashcard({
									...editedFlashcard,
									front: e.target.value,
								})
							}
							className={errors.front ? 'border-red-500' : ''}
						/>
						{errors.front && (
							<p className="text-sm text-red-500">{errors.front}</p>
						)}
						<p className="text-sm text-gray-500">
							{editedFlashcard.front.length}/200 znaków
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="back">Tył fiszki</Label>
						<Textarea
							id="back"
							value={editedFlashcard.back}
							onChange={(e) =>
								setEditedFlashcard({
									...editedFlashcard,
									back: e.target.value,
								})
							}
							className={errors.back ? 'border-red-500' : ''}
						/>
						{errors.back && (
							<p className="text-sm text-red-500">{errors.back}</p>
						)}
						<p className="text-sm text-gray-500">
							{editedFlashcard.back.length}/500 znaków
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Anuluj
					</Button>
					<Button onClick={handleSave}>Zapisz zmiany</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
