import { NextResponse } from 'next/server';
import { z } from 'zod';
import type {
	CreateFlashcardsResponseDto,
	FlashcardsQueryParams,
} from '@/types/types';
import {
	DEFAULT_USER_ID,
	supabaseClient,
} from '@/db/supabase.client';

import { FlashcardsService } from '@/lib/flashcards.service';
import { flashcardsService } from '@/lib/flashcards.service';

// Schema walidacji dla pojedynczej fiszki
const flashcardSchema = z.object({
	front: z
		.string()
		.max(200, 'Front text cannot exceed 200 characters'),
	back: z.string().max(500, 'Back text cannot exceed 500 characters'),
	source: z.enum(['manual', 'ai', 'ai-edited']),
	generation_id: z.string().uuid().nullable().optional(),
});

// Schema walidacji dla całego żądania
const createFlashcardsSchema = z.object({
	flashcards: z
		.array(flashcardSchema)
		.min(1, 'At least one flashcard is required')
		.max(100, 'Maximum 100 flashcards per request'),
});

export async function POST(request: Request) {
	try {
		// Parsowanie body żądania
		const body = await request.json();

		// Walidacja danych wejściowych
		const validationResult = createFlashcardsSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Validation error',
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		// Inicjalizacja serwisu
		const flashcardsService = new FlashcardsService(supabaseClient);

		// Tworzenie fiszek
		const createdFlashcards =
			await flashcardsService.createFlashcards(
				DEFAULT_USER_ID,
				validationResult.data.flashcards,
			);

		// Przygotowanie odpowiedzi
		const response: CreateFlashcardsResponseDto = {
			flashcards: createdFlashcards,
		};

		return NextResponse.json(response, { status: 201 });
	} catch (error) {
		console.error('Error processing flashcards creation:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function GET(request: Request) {
	try {
		// Pobierz user_id z kontekstu (dodane przez middleware)
		const userId = request.headers.get('x-user-id');
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// Pobierz parametry z URL jako stringi (schema w serwisie je sparsuje)
		const url = new URL(request.url);
		const params: FlashcardsQueryParams = {
			page: url.searchParams.get('page') ?? undefined,
			per_page: url.searchParams.get('per_page') ?? undefined,
			search: url.searchParams.get('search') ?? undefined,
			sort:
				(url.searchParams.get(
					'sort',
				) as FlashcardsQueryParams['sort']) ?? undefined,
		};

		// Pobierz fiszki
		const response = await flashcardsService.getFlashcards(
			userId,
			params,
		);

		return NextResponse.json(response);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: error.errors,
				},
				{ status: 400 },
			);
		}

		console.error('Error fetching flashcards:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
