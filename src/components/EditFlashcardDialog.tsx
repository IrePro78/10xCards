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
		useState<FlashcardListDto | null>(null);
	const [errors, setErrors] = useState<ValidationErrors>({});

	useEffect(() => {
		setEditedFlashcard(flashcard);
		setErrors({});
	}, [flashcard]);

	const validateField = (name: 'front' | 'back', value: string) => {
		if (!value.trim()) {
			return 'Pole nie może być puste';
		}
		const maxLength = name === 'front' ? 200 : 500;
		if (value.length > maxLength) {
			return `Pole nie może przekraczać ${maxLength} znaków`;
		}
		return '';
	};

	const handleFieldChange = (
		name: 'front' | 'back',
		value: string,
	) => {
		if (!editedFlashcard) return;

		// Aktualizujemy wartość pola
		setEditedFlashcard({
			...editedFlashcard,
			[name]: value,
		});

		// Sprawdzamy walidację
		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));
	};

	const handleSave = () => {
		if (!editedFlashcard) return;

		// Sprawdzamy walidację obu pól przed zapisem
		const frontError = validateField('front', editedFlashcard.front);
		const backError = validateField('back', editedFlashcard.back);

		const newErrors = {
			front: frontError,
			back: backError,
		};

		setErrors(newErrors);

		// Jeśli są błędy, przerywamy
		if (frontError || backError) {
			return;
		}

		onSave(editedFlashcard);
	};

	if (!editedFlashcard) return null;

	const isFormValid =
		editedFlashcard.front.trim() !== '' &&
		editedFlashcard.back.trim() !== '' &&
		Object.values(errors).every((error) => !error);

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
									handleFieldChange('front', e.target.value)
								}
								onBlur={(e) =>
									handleFieldChange('front', e.target.value)
								}
								placeholder="Wpisz pytanie lub termin..."
								className={`border-input bg-card text-card-foreground hover:border-muted focus:border-ring h-10 rounded-lg text-[15px] transition-all focus:ring-0 ${
									errors.front ? 'border-destructive' : ''
								}`}
								maxLength={200}
							/>
							{errors.front && (
								<p className="text-destructive text-sm">
									{errors.front}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								{editedFlashcard.front.length}/200 znaków
							</p>
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
									handleFieldChange('back', e.target.value)
								}
								onBlur={(e) =>
									handleFieldChange('back', e.target.value)
								}
								placeholder="Wpisz odpowiedź lub definicję..."
								className={`border-input bg-card text-card-foreground hover:border-muted focus:border-ring min-h-[100px] rounded-lg text-[15px] transition-all focus:ring-0 ${
									errors.back ? 'border-destructive' : ''
								}`}
								maxLength={500}
							/>
							{errors.back && (
								<p className="text-destructive text-sm">
									{errors.back}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								{editedFlashcard.back.length}/500 znaków
							</p>
						</div>
					</div>
				</div>
				<DialogFooter className="mt-8 flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={onClose}
						className="h-10 min-w-[100px] rounded-lg border-[1.5px] border-[#222222] bg-white text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
					>
						Anuluj
					</Button>
					<Button
						variant="outline"
						onClick={handleSave}
						disabled={!isFormValid}
						className="h-10 min-w-[100px] rounded-lg border-[#222222] bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:border-[#E31C5F] hover:bg-[#E31C5F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
					>
						Zapisz
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
