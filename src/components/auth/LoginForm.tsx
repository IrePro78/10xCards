'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
	const router = useRouter();

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

			<div className="space-y-4">
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
							errors.password ? 'border-destructive' : ''
						}`}
					/>
					{errors.password && (
						<p className="text-destructive text-sm">
							{errors.password}
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
						'Zaloguj się'
					)}
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
			</div>
		</div>
	);
}
