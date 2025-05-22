'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { GenerationCandidateDto } from '@/types/types';

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
			<DialogContent className="rounded-lg border border-gray-200 bg-white p-0 shadow-lg sm:max-w-[500px]">
				<DialogHeader className="border-b border-gray-100 px-6 py-4">
					<DialogTitle className="text-lg font-medium text-gray-700">
						Edycja fiszki
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<Label
							htmlFor="front"
							className="text-sm font-medium text-gray-600"
						>
							Przód fiszki
						</Label>
						<Textarea
							id="front"
							value={editedFlashcard.front}
							onChange={(e) =>
								setEditedFlashcard({
									...editedFlashcard,
									front: e.target.value,
								})
							}
							className={`font-inherit min-h-[100px] w-full resize-y rounded-md border p-3 text-sm leading-relaxed text-gray-900 shadow-sm transition-all focus:outline-none ${
								errors.front
									? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
									: 'border-gray-300 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
							}`}
						/>
						{errors.front && (
							<p className="text-sm text-red-500">{errors.front}</p>
						)}
						<p
							className={`text-xs ${editedFlashcard.front.length > 200 ? 'text-red-500' : 'text-gray-500'}`}
						>
							{editedFlashcard.front.length}/200 znaków
						</p>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="back"
							className="text-sm font-medium text-gray-600"
						>
							Tył fiszki
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
							className={`font-inherit min-h-[100px] w-full resize-y rounded-md border p-3 text-sm leading-relaxed text-gray-900 shadow-sm transition-all focus:outline-none ${
								errors.back
									? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
									: 'border-gray-300 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
							}`}
						/>
						{errors.back && (
							<p className="text-sm text-red-500">{errors.back}</p>
						)}
						<p
							className={`text-xs ${editedFlashcard.back.length > 500 ? 'text-red-500' : 'text-gray-500'}`}
						>
							{editedFlashcard.back.length}/500 znaków
						</p>
					</div>
				</div>

				<DialogFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="inline-flex transform items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-gray-400 hover:bg-gray-50 active:translate-y-0.5 active:scale-95 active:bg-gray-100"
							type="button"
						>
							Anuluj
						</button>
						<button
							onClick={handleSave}
							className="inline-flex transform items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0.5 active:scale-95 active:bg-blue-100"
							type="button"
						>
							<span className="text-blue-400">✓</span>
							<span className="ml-1.5">Zapisz zmiany</span>
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
