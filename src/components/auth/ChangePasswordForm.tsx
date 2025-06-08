'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/actions/auth';
import { toast } from 'sonner';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
	return (
		<Button
			disabled={isSubmitting}
			className="h-12 w-full rounded-lg bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98] disabled:opacity-50"
		>
			{isSubmitting ? (
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
			) : (
				'Zmień hasło'
			)}
		</Button>
	);
}

interface ValidationErrors {
	currentPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
}

export function ChangePasswordForm() {
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateField = (
		name: 'currentPassword' | 'newPassword' | 'confirmPassword',
		value: string,
	) => {
		if (!value.trim()) {
			return 'Pole nie może być puste';
		}
		if (name === 'newPassword') {
			if (value.length < 8) {
				return 'Hasło musi mieć co najmniej 8 znaków';
			}
			if (!/[A-Z]/.test(value)) {
				return 'Hasło musi zawierać co najmniej jedną wielką literę';
			}
			if (!/[0-9]/.test(value)) {
				return 'Hasło musi zawierać co najmniej jedną cyfrę';
			}
			if (value === formData.currentPassword) {
				return 'Nowe hasło musi być inne niż obecne';
			}
		}
		if (name === 'confirmPassword') {
			if (value !== formData.newPassword) {
				return 'Hasła nie są zgodne';
			}
		}
		return '';
	};

	const handleFieldChange = (
		name: 'currentPassword' | 'newPassword' | 'confirmPassword',
		value: string,
	) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));

		if (name === 'newPassword' && formData.confirmPassword) {
			const confirmError = validateField(
				'confirmPassword',
				formData.confirmPassword,
			);
			setErrors((prev) => ({
				...prev,
				confirmPassword: confirmError,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		setIsLoading(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append(
				'currentPassword',
				formData.currentPassword,
			);
			formDataToSend.append('newPassword', formData.newPassword);

			const result = await changePassword(formDataToSend);

			if (result?.error) {
				console.error('Błąd z serwera:', result.error);
				toast.error(result.error);
			} else if (result?.success) {
				toast.success('Hasło zostało pomyślnie zmienione');
				setFormData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
			}
		} catch (err) {
			console.error('Błąd podczas wysyłania formularza:', err);
			toast.error(
				'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isFormValid =
		formData.currentPassword.trim() !== '' &&
		formData.newPassword.trim() !== '' &&
		formData.confirmPassword.trim() !== '' &&
		Object.values(errors).every((error) => !error);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold tracking-tight">
					Zmiana hasła
				</h2>
				<p className="text-muted-foreground text-sm">
					Wprowadź swoje obecne hasło oraz nowe hasło
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="currentPassword">Obecne hasło</Label>
					<Input
						id="currentPassword"
						type="password"
						placeholder="••••••••"
						value={formData.currentPassword}
						onChange={(e) =>
							handleFieldChange('currentPassword', e.target.value)
						}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.currentPassword ? 'border-destructive' : ''
						}`}
					/>
					{errors.currentPassword && (
						<p className="text-destructive text-sm">
							{errors.currentPassword}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="newPassword">Nowe hasło</Label>
					<Input
						id="newPassword"
						type="password"
						placeholder="••••••••"
						value={formData.newPassword}
						onChange={(e) =>
							handleFieldChange('newPassword', e.target.value)
						}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.newPassword ? 'border-destructive' : ''
						}`}
					/>
					{errors.newPassword && (
						<p className="text-destructive text-sm">
							{errors.newPassword}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">
						Potwierdź nowe hasło
					</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						value={formData.confirmPassword}
						onChange={(e) =>
							handleFieldChange('confirmPassword', e.target.value)
						}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.confirmPassword ? 'border-destructive' : ''
						}`}
					/>
					{errors.confirmPassword && (
						<p className="text-destructive text-sm">
							{errors.confirmPassword}
						</p>
					)}
				</div>

				<SubmitButton isSubmitting={isLoading} />
			</form>
		</div>
	);
}
