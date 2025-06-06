'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/actions/auth';
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
				'Wyślij link do resetowania'
			)}
		</Button>
	);
}

interface ValidationErrors {
	email?: string;
}

export function ForgotPasswordForm() {
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			return 'Pole nie może być puste';
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			return 'Nieprawidłowy format adresu email';
		}
		return '';
	};

	const handleEmailChange = (value: string) => {
		setEmail(value);
		const error = validateEmail(value);
		setErrors({ email: error });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		setIsLoading(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append('email', email);

			const result = await forgotPassword(formDataToSend);

			if (result?.error) {
				console.error('Błąd z serwera:', result.error);
				toast.error(result.error);
			} else if (result?.success) {
				setIsSuccess(true);
				toast.success(
					'Link do resetowania hasła został wysłany na Twój adres email',
				);
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

	const isFormValid = email.trim() !== '' && !errors.email;

	return (
		<div className="mx-auto max-w-[400px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Zapomniałeś hasła?
				</h1>
				<p className="text-muted-foreground text-sm">
					Wprowadź swój adres email, a wyślemy Ci link do zresetowania
					hasła
				</p>
			</div>

			{isSuccess ? (
				<div className="space-y-4">
					<div className="rounded-lg bg-[#00A699]/10 p-4 text-center">
						<p className="font-medium text-[#00A699]">
							Link do resetowania hasła został wysłany na Twój adres
							email
						</p>
					</div>
					<Link
						href="/login"
						className="block text-center font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
					>
						Powrót do logowania
					</Link>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Adres email</Label>
						<Input
							id="email"
							type="email"
							placeholder="przyklad@email.com"
							value={email}
							onChange={(e) => handleEmailChange(e.target.value)}
							className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
								errors.email ? 'border-destructive' : ''
							}`}
						/>
						{errors.email && (
							<p className="text-destructive text-sm">
								{errors.email}
							</p>
						)}
					</div>

					<SubmitButton isSubmitting={isLoading} />

					<div className="text-muted-foreground text-center text-sm">
						Pamiętasz hasło?{' '}
						<Link
							href="/login"
							className="font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]"
						>
							Zaloguj się
						</Link>
					</div>
				</form>
			)}
		</div>
	);
}
