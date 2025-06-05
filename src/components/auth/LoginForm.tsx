'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { login } from '@/actions/auth';
import {
	loginSchema,
	type LoginFormData,
} from '@/lib/validations/auth';
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
				'Zaloguj się'
			)}
		</Button>
	);
}

export function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		const formData = new FormData();
		formData.append('email', data.email);
		formData.append('password', data.password);

		try {
			const result = await login(formData);
			if (!result?.error) {
				toast.success('Zalogowano pomyślnie!');
			} else {
				toast.error(result.error);
			}
		} catch (err) {
			if (
				err instanceof Error &&
				!err.message.includes('NEXT_REDIRECT')
			) {
				console.error('Błąd logowania:', err);
				toast.error(
					'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
				);
			} else {
				toast.success('Zalogowano pomyślnie!');
			}
		}
	};

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

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Adres email</Label>
					<Input
						id="email"
						type="email"
						placeholder="przyklad@email.com"
						{...register('email')}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.email ? 'border-destructive' : ''
						}`}
					/>
					{errors.email && (
						<p className="text-destructive text-sm">
							{errors.email.message}
						</p>
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
						{...register('password')}
						className={`border-input bg-background text-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0 ${
							errors.password ? 'border-destructive' : ''
						}`}
					/>
					{errors.password && (
						<p className="text-destructive text-sm">
							{errors.password.message}
						</p>
					)}
				</div>

				<SubmitButton isSubmitting={isSubmitting} />

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
