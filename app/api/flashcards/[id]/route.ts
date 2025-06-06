import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
	FlashcardIdParams,
	UpdateFlashcardResponseDto,
	DeleteFlashcardResponseDto,
} from '@/types/types';
import {
	updateFlashcard,
	deleteFlashcard,
} from '@/lib/flashcards.service';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Schema dla walidacji UUID
const idSchema = z.string().uuid();

// Schema dla body żądania PUT
const updateFlashcardSchema = z
	.object({
		front: z.string().max(200).optional(),
		back: z.string().max(500).optional(),
	})
	.refine((data) => data.front || data.back, {
		message: "At least one of 'front' or 'back' must be provided",
	});

/**
 * PUT /api/flashcards/[id]
 * Aktualizuje istniejącą fiszkę
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: FlashcardIdParams },
) {
	try {
		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					},
				},
			},
		);

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// Walidacja ID
		const { id } = await params;
		const validatedId = idSchema.parse(id);

		// Walidacja body
		const body = await request.json();
		const validatedBody = updateFlashcardSchema.parse(body);

		// Aktualizacja fiszki
		const updatedFlashcard = await updateFlashcard(
			supabase,
			validatedId,
			validatedBody,
			user.id,
		);

		// Przygotowanie odpowiedzi
		const response: UpdateFlashcardResponseDto = {
			id: updatedFlashcard.id,
			front: updatedFlashcard.front,
			back: updatedFlashcard.back,
			updated_at: updatedFlashcard.updated_at,
		};

		return NextResponse.json(response);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 },
			);
		}

		if (
			error instanceof Error &&
			error.message === 'Flashcard not found'
		) {
			return NextResponse.json(
				{ error: 'Flashcard not found' },
				{ status: 404 },
			);
		}

		console.error('Error updating flashcard:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/flashcards/[id]
 * Usuwa fiszkę
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: FlashcardIdParams },
) {
	try {
		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					},
				},
			},
		);

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// Walidacja ID
		const { id } = await params;
		const validatedId = idSchema.parse(id);

		// Usunięcie fiszki
		await deleteFlashcard(supabase, validatedId, user.id);

		const response: DeleteFlashcardResponseDto = {
			message: 'Flashcard deleted successfully.',
		};

		return NextResponse.json(response);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid UUID format' },
				{ status: 400 },
			);
		}

		console.error('Error deleting flashcard:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
