import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
	DEFAULT_USER_ID,
	supabaseClient,
} from '@/db/supabase.client';
import { GenerationsService } from '@/lib/generations.service';

// Schemat walidacji dla żądania tworzenia generacji
const createGenerationSchema = z.object({
	source_text: z
		.string()
		.min(1000, 'Tekst źródłowy musi zawierać co najmniej 1000 znaków')
		.max(10000, 'Tekst źródłowy nie może przekraczać 10000 znaków'),
});

/**
 * Endpoint POST /generations
 *
 * Tworzy nową sesję generacji fiszek na podstawie tekstu źródłowego.
 *
 * @param request - Żądanie HTTP z danymi wejściowymi (source_text)
 * @returns Odpowiedź HTTP z nowo utworzoną sesją generacji (kod 201) lub odpowiedni błąd
 */
export async function POST(request: NextRequest) {
	try {
		// 1. Parsowanie i walidacja danych wejściowych
		const body = await request.json();
		const validationResult = createGenerationSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Nieprawidłowe dane wejściowe',
					details: validationResult.error.format(),
				},
				{ status: 400 },
			);
		}

		const { source_text } = validationResult.data;

		// 2. Użycie domyślnego id użytkownika na potrzeby developmentu
		const user_id = DEFAULT_USER_ID;

		// 3. Użycie serwisu do utworzenia generacji
		const generationsService = new GenerationsService(supabaseClient);
		const generationWithCandidates =
			await generationsService.createGeneration(user_id, source_text);

		// 4. Zwrócenie odpowiedzi z nowo utworzoną sesją generacji
		return NextResponse.json(generationWithCandidates, {
			status: 201,
		});
	} catch (error: unknown) {
		console.error('Nieoczekiwany błąd:', error);

		const errorMessage =
			error instanceof Error ? error.message : 'Nieznany błąd';

		return NextResponse.json(
			{
				error: 'Wystąpił nieoczekiwany błąd',
				details: errorMessage,
			},
			{ status: 500 },
		);
	}
}
