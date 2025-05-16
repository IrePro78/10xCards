import { NextResponse } from 'next/server';
import { z } from 'zod';
import type {
	CreateFlashcardsRequestDto,
	CreateFlashcardsResponseDto,
} from '@/types';
import {
	DEFAULT_USER_ID,
	supabaseClient,
} from '@/db/supabase.client';

import { FlashcardsService } from '@/lib/flashcards.service';

// Schema walidacji dla pojedynczej fiszki
const flashcardSchema = z.object({
	front: z
		.string()
		.max(200, 'Front text cannot exceed 200 characters'),
	back: z.string().max(500, 'Back text cannot exceed 500 characters'),
	source: z.enum(['manual', 'user']),
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
