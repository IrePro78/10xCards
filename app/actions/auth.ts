'use server';

import { createSupabaseServerClient } from '@/db/supabase.server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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
