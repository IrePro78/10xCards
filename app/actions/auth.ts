'use server';

import { createSupabaseServerClient } from '@/db/supabase.server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limiting
const RATE_LIMIT = {
	MAX_ATTEMPTS: 5,
	BLOCK_DURATION: 2 * 60 * 1000, // 2 minuty w milisekundach
};

const loginAttempts = new Map<
	string,
	{ count: number; timestamp: number }
>();

export async function login(formData: FormData) {
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	// Sprawdzenie rate limitingu
	const cookieStore = await cookies();
	const ipAddress = cookieStore.get('client-ip')?.value || 'unknown';
	const attempt = loginAttempts.get(ipAddress);
	const now = Date.now();

	if (attempt) {
		if (attempt.count >= RATE_LIMIT.MAX_ATTEMPTS) {
			const timeElapsed = now - attempt.timestamp;
			if (timeElapsed < RATE_LIMIT.BLOCK_DURATION) {
				const remainingTime = Math.ceil(
					(RATE_LIMIT.BLOCK_DURATION - timeElapsed) / 1000 / 60,
				);
				return {
					error: `Zbyt wiele prób logowania. Spróbuj ponownie za ${remainingTime} minut.`,
				};
			}
			// Reset po upływie czasu blokady
			loginAttempts.delete(ipAddress);
		}
	}

	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		// Aktualizacja licznika prób
		const currentAttempt = loginAttempts.get(ipAddress) || {
			count: 0,
			timestamp: now,
		};
		loginAttempts.set(ipAddress, {
			count: currentAttempt.count + 1,
			timestamp: now,
		});

		if (error.message === 'Email not confirmed') {
			return { error: 'Konto nie zostało potwierdzone' };
		}

		if (error.message === 'Account disabled') {
			return { error: 'Konto zablokowane' };
		}

		return { error: 'Nieprawidłowy email lub hasło' };
	}

	// Reset licznika prób po udanym logowaniu
	loginAttempts.delete(ipAddress);

	revalidatePath('/', 'layout');
	redirect('/generate');
}

export async function logout() {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return { error: 'Wystąpił błąd podczas wylogowywania' };
	}

	revalidatePath('/', 'layout');
	redirect('/login');
}

export async function getUser() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return { user };
}

export async function register(formData: FormData) {
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	const supabase = await createSupabaseServerClient();

	try {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
			},
		});

		if (error) {
			console.error('Błąd rejestracji Supabase:', error);

			// Mapowanie komunikatów błędów na przyjazne dla użytkownika wersje
			if (error.message.includes('already registered')) {
				return { error: 'Ten adres email jest już zarejestrowany' };
			}
			if (error.message.includes('invalid email')) {
				return { error: 'Nieprawidłowy format adresu email' };
			}
			if (error.message.includes('password')) {
				return { error: 'Hasło nie spełnia wymagań bezpieczeństwa' };
			}

			return { error: error.message };
		}

		// W środowisku lokalnym, emaile można sprawdzić pod adresem:
		// http://localhost:54324 (Inbucket - lokalny serwer testowy email)

		revalidatePath('/', 'layout');
		return { success: true };
	} catch (err) {
		console.error('Nieoczekiwany błąd podczas rejestracji:', err);
		return {
			error:
				'Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.',
		};
	}
}

export async function resetPassword(formData: FormData) {
	const password = formData.get('password') as string;
	const code = formData.get('code') as string;
	const token = formData.get('token') as string;

	if (!code && !token) {
		return { error: 'Brak kodu resetowania hasła' };
	}

	const supabase = await createSupabaseServerClient();

	try {
		// Obsługa nowego formatu (code)
		if (code) {
			const { error } =
				await supabase.auth.exchangeCodeForSession(code);

			if (error) {
				console.error('Błąd wymiany kodu na sesję:', error);
				return {
					error: 'Nieprawidłowy lub wygasły kod resetowania hasła',
				};
			}
		}
		// Obsługa starego formatu (token)
		else if (token) {
			const { error } = await supabase.auth.verifyOtp({
				token_hash: token,
				type: 'recovery',
			});

			if (error) {
				console.error('Błąd weryfikacji tokena:', error);
				return {
					error: 'Nieprawidłowy lub wygasły token resetowania hasła',
				};
			}
		}

		const { error: updateError } = await supabase.auth.updateUser({
			password: password,
		});

		if (updateError) {
			console.error('Błąd resetowania hasła:', updateError);

			// Mapowanie komunikatów błędów na przyjazne dla użytkownika wersje
			if (updateError.message.includes('password')) {
				return { error: 'Hasło nie spełnia wymagań bezpieczeństwa' };
			}
			if (updateError.message.includes('auth')) {
				return {
					error: 'Błąd autoryzacji. Spróbuj ponownie później.',
				};
			}

			return { error: updateError.message };
		}

		revalidatePath('/', 'layout');
		return { success: true };
	} catch (err) {
		console.error(
			'Nieoczekiwany błąd podczas resetowania hasła:',
			err,
		);
		return {
			error:
				'Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie później.',
		};
	}
}

export async function forgotPassword(formData: FormData) {
	const email = formData.get('email') as string;

	const supabase = await createSupabaseServerClient();

	try {
		const { error } = await supabase.auth.resetPasswordForEmail(
			email,
			{
				redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
			},
		);

		if (error) {
			console.error('Błąd wysyłania linku resetującego:', error);

			// Mapowanie komunikatów błędów na przyjazne dla użytkownika wersje
			if (error.message.includes('email')) {
				return { error: 'Nieprawidłowy format adresu email' };
			}
			if (error.message.includes('user not found')) {
				// Dla bezpieczeństwa nie informujemy, że użytkownik nie istnieje
				return { success: true };
			}

			return { error: error.message };
		}

		// W środowisku lokalnym, emaile można sprawdzić pod adresem:
		// http://localhost:54324 (Inbucket - lokalny serwer testowy email)

		return { success: true };
	} catch (err) {
		console.error('Nieoczekiwany błąd podczas wysyłania linku:', err);
		return {
			error:
				'Wystąpił błąd podczas wysyłania linku. Spróbuj ponownie później.',
		};
	}
}

export async function changePassword(formData: FormData) {
	const currentPassword = formData.get('currentPassword') as string;
	const newPassword = formData.get('newPassword') as string;

	const supabase = await createSupabaseServerClient();

	try {
		// Pobierz aktualnego użytkownika
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user?.email) {
			return { error: 'Nie znaleziono użytkownika' };
		}

		// Najpierw sprawdź czy obecne hasło jest poprawne
		const { error: signInError } =
			await supabase.auth.signInWithPassword({
				email: user.email,
				password: currentPassword,
			});

		if (signInError) {
			if (signInError.message.includes('Invalid login credentials')) {
				return { error: 'Obecne hasło jest nieprawidłowe' };
			}
			return { error: signInError.message };
		}

		// Jeśli obecne hasło jest poprawne, zmień na nowe
		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (updateError) {
			console.error('Błąd zmiany hasła:', updateError);

			if (updateError.message.includes('password')) {
				return { error: 'Hasło nie spełnia wymagań bezpieczeństwa' };
			}
			if (updateError.message.includes('auth')) {
				return {
					error: 'Błąd autoryzacji. Spróbuj ponownie później.',
				};
			}

			return { error: updateError.message };
		}

		return { success: true };
	} catch (err) {
		console.error('Nieoczekiwany błąd podczas zmiany hasła:', err);
		return {
			error:
				'Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie później.',
		};
	}
}

export async function deleteAccount(formData: FormData) {
	const password = formData.get('password') as string;

	if (!password?.trim()) {
		return {
			error: 'Wprowadź hasło, aby potwierdzić usunięcie konta',
		};
	}

	const supabase = await createSupabaseServerClient();

	try {
		// Pobierz aktualnego użytkownika
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user?.email) {
			return { error: 'Nie znaleziono użytkownika' };
		}

		// Najpierw sprawdź czy hasło jest poprawne
		const { error: signInError } =
			await supabase.auth.signInWithPassword({
				email: user.email,
				password: password,
			});

		if (signInError) {
			if (signInError.message.includes('Invalid login credentials')) {
				return { error: 'Podane hasło jest nieprawidłowe' };
			}
			return { error: signInError.message };
		}

		// Jeśli hasło jest poprawne, usuń konto
		const { error: deleteError } = await supabase.rpc('delete_user');

		if (deleteError) {
			console.error('Błąd podczas usuwania konta:', deleteError);
			return {
				error:
					'Wystąpił błąd podczas usuwania konta. Spróbuj ponownie później.',
			};
		}

		// Wyloguj użytkownika
		await supabase.auth.signOut();

		return { success: true };
	} catch (err) {
		console.error('Nieoczekiwany błąd podczas usuwania konta:', err);
		return {
			error: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
		};
	}
}
