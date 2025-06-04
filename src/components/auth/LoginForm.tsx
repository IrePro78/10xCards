'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ValidationErrors {
	email?: string;
	password?: string;
}

export function LoginForm() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const validateField = (
		name: 'email' | 'password',
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
		return '';
	};

	const handleFieldChange = (
		name: 'email' | 'password',
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

		// Reset server error when user starts typing
		setServerError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setServerError(null);

		const formDataToSend = new FormData();
		formDataToSend.append('email', formData.email);
		formDataToSend.append('password', formData.password);

		try {
			const result = await login(formDataToSend);
			if (result?.error) {
				setServerError(result.error);
			}
		} catch (_error) {
			setServerError(
				'Wystąpił błąd podczas logowania. Spróbuj ponownie później.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isFormValid =
		formData.email.trim() !== '' &&
		formData.password.trim() !== '' &&
		Object.values(errors).every((error) => !error);

	return (
		<div className="mx-auto max-w-[400px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Witaj ponownie!
				</h1>
				<p className="text-muted-foreground text-sm">
					Zaloguj się do swojego konta
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
							errors.email || serverError ? 'border-destructive' : ''
						}`}
					/>
					{errors.email && (
						<p className="text-destructive text-sm">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Hasło</Label>
						<Link
							href="/forgot-password"
							className="text-muted-foreground hover:text-foreground text-sm transition-colors"
						>
							Zapomniałeś hasła?
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						value={formData.password}
						onChange={(e) =>
							handleFieldChange('password', e.target.value)
						}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.password || serverError
								? 'border-destructive'
								: ''
						}`}
					/>
					{errors.password && (
						<p className="text-destructive text-sm">
							{errors.password}
						</p>
					)}
				</div>

				{serverError && (
					<p className="text-destructive text-center text-sm">
						{serverError}
					</p>
				)}

				<Button
					asChild
					disabled={!isFormValid || isLoading}
					className="h-12 w-full rounded-lg bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:bg-[#E31C5F] active:scale-[0.98] disabled:opacity-50"
				>
					<button type="submit">
						{isLoading ? (
							<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							'Zaloguj się'
						)}
					</button>
				</Button>

				<div className="text-muted-foreground text-center text-sm">
					Nie masz jeszcze konta?{' '}
					<Link
						href="/register"
						className="font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
					>
						Zarejestruj się
					</Link>
				</div>
			</form>
		</div>
	);
}
