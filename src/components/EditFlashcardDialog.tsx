'use client';

import { useState, useEffect } from 'react';
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
import type { GenerationCandidateDto } from '@/types/types';

interface EditFlashcardDialogProps {
	flashcard: GenerationCandidateDto | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (flashcard: GenerationCandidateDto) => void;
}

export function EditFlashcardDialog({
	flashcard,
	isOpen,
	onClose,
	onSave,
}: EditFlashcardDialogProps) {
	const [front, setFront] = useState('');
	const [back, setBack] = useState('');
	const [frontError, setFrontError] = useState<string | null>(null);
	const [backError, setBackError] = useState<string | null>(null);

	useEffect(() => {
		if (flashcard) {
			setFront(flashcard.front);
			setBack(flashcard.back);
		}
	}, [flashcard]);

	const validateFields = () => {
		let isValid = true;

		if (!front.trim()) {
			setFrontError('Przód fiszki nie może być pusty');
			isValid = false;
		} else {
			setFrontError(null);
		}

		if (!back.trim()) {
			setBackError('Tył fiszki nie może być pusty');
			isValid = false;
		} else {
			setBackError(null);
		}

		return isValid;
	};

	const handleSave = () => {
		if (validateFields() && flashcard) {
			onSave({
				...flashcard,
				front: front.trim(),
				back: back.trim(),
			});
			onClose();
		}
	};

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
				<DialogContent className="fixed top-[50%] left-[50%] flex translate-x-[-50%] translate-y-[-50%] flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:max-w-xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold text-gray-900">
							Edytuj fiszkę
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="front"
								className="text-xl font-semibold text-gray-900"
							>
								Przód fiszki
							</Label>
							<Textarea
								id="front"
								value={front}
								onChange={(e) => setFront(e.target.value)}
								maxLength={200}
								className={`min-h-[80px] resize-y rounded-xl border border-gray-200 bg-white p-4 ${frontError ? 'border-red-600 focus-visible:ring-red-600' : ''}`}
							/>
							{frontError && (
								<p className="text-sm font-medium text-red-600">
									{frontError}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="back"
								className="text-xl font-semibold text-gray-900"
							>
								Tył fiszki
							</Label>
							<Textarea
								id="back"
								value={back}
								onChange={(e) => setBack(e.target.value)}
								maxLength={500}
								className={`min-h-[160px] resize-y rounded-xl border border-gray-200 bg-white p-4 ${backError ? 'border-red-600 focus-visible:ring-red-600' : ''}`}
							/>
							{backError && (
								<p className="text-sm font-medium text-red-600">
									{backError}
								</p>
							)}
						</div>
					</div>

					<DialogFooter className="flex justify-end gap-2 border-t border-gray-200 pt-6">
						<Button onClick={onClose} variant="outline-destructive">
							Anuluj
						</Button>
						<Button onClick={handleSave} variant="outline-info">
							Zapisz zmiany
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
