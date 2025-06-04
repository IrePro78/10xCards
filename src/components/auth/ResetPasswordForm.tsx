'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ValidationErrors {
	password?: string;
	confirmPassword?: string;
}

export function ResetPasswordForm() {
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const validateField = (
		name: 'password' | 'confirmPassword',
		value: string,
	) => {
		if (!value.trim()) {
			return 'Pole nie może być puste';
		}
		if (name === 'password') {
			if (value.length < 8) {
				return 'Hasło musi mieć co najmniej 8 znaków';
			}
			if (!/[A-Z]/.test(value)) {
				return 'Hasło musi zawierać co najmniej jedną wielką literę';
			}
			if (!/[0-9]/.test(value)) {
				return 'Hasło musi zawierać co najmniej jedną cyfrę';
			}
		}
		if (name === 'confirmPassword') {
			if (value !== formData.password) {
				return 'Hasła nie są zgodne';
			}
		}
		return '';
	};

	const handleFieldChange = (
		name: 'password' | 'confirmPassword',
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

		// Dodatkowo sprawdzamy potwierdzenie hasła przy zmianie hasła
		if (name === 'password' && formData.confirmPassword) {
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

	const isFormValid =
		formData.password.trim() !== '' &&
		formData.confirmPassword.trim() !== '' &&
		Object.values(errors).every((error) => !error);

	return (
		<div className="mx-auto max-w-[400px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Ustaw nowe hasło
				</h1>
				<p className="text-muted-foreground text-sm">
					Wprowadź i potwierdź swoje nowe hasło
				</p>
			</div>

			{isSuccess ? (
				<div className="space-y-4">
					<div className="rounded-lg bg-[#00A699]/10 p-4 text-center">
						<p className="font-medium text-[#00A699]">
							Hasło zostało pomyślnie zmienione
						</p>
					</div>
					<Link
						href="/login"
						className="block text-center font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
					>
						Przejdź do logowania
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Nowe hasło</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={formData.password}
							onChange={(e) =>
								handleFieldChange('password', e.target.value)
							}
							className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
								errors.password ? 'border-destructive' : ''
							}`}
						/>
						{errors.password && (
							<p className="text-destructive text-sm">
								{errors.password}
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

					<Button
						disabled={!isFormValid || isLoading}
						className="h-12 w-full rounded-lg bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98] disabled:opacity-50"
					>
						{isLoading ? (
							<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							'Ustaw nowe hasło'
						)}
					</Button>

					<div className="text-muted-foreground text-center text-sm">
						<Link
							href="/login"
							className="font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
						>
							Powrót do logowania
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
