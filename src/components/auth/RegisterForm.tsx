'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { register } from '@/actions/auth';
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
				'Zarejestruj się'
			)}
		</Button>
	);
}

interface ValidationErrors {
	email?: string;
	password?: string;
	confirmPassword?: string;
}

export function RegisterForm() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateField = (
		name: 'email' | 'password' | 'confirmPassword',
		value: string,
	) => {
		if (!value.trim()) {
			return 'Pole nie może być puste';
		}
		if (name === 'email') {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				return 'Nieprawidłowy format adresu email';
			}
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
		name: 'email' | 'password' | 'confirmPassword',
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		setIsLoading(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append('email', formData.email);
			formDataToSend.append('password', formData.password);

			const result = await register(formDataToSend);

			if (result?.error) {
				console.error('Błąd z serwera:', result.error);
				toast.error(result.error);
			} else if (result?.success) {
				toast.success(
					'Link aktywacyjny został wysłany na Twój adres email. Sprawdź swoją skrzynkę odbiorczą.',
				);
				// Dajemy czas na pokazanie toasta przed przekierowaniem
				setTimeout(() => {
					window.location.href = '/login';
				}, 2000);
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
		formData.email.trim() !== '' &&
		formData.password.trim() !== '' &&
		formData.confirmPassword.trim() !== '' &&
		Object.values(errors).every((error) => !error);

	return (
		<div className="mx-auto max-w-[400px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Stwórz nowe konto
				</h1>
				<p className="text-muted-foreground text-sm">
					Wprowadź swoje dane, aby się zarejestrować
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Adres email</Label>
					<Input
						id="email"
						type="email"
						placeholder="przyklad@email.com"
						value={formData.email}
						onChange={(e) =>
							handleFieldChange('email', e.target.value)
						}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.email ? 'border-destructive' : ''
						}`}
					/>
					{errors.email && (
						<p className="text-destructive text-sm">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Hasło</Label>
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
					<Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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

				<div className="text-muted-foreground text-center text-sm">
					Masz już konto?{' '}
					<Link
						href="/login"
						className="font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
					>
						Zaloguj się
					</Link>
				</div>
			</form>
		</div>
	);
}
