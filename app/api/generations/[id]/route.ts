import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Schema walidacji dla aktualizacji generacji
const updateGenerationSchema = z.object({
	status: z.enum(['pending', 'completed', 'error']),
	accepted_unedited_count: z.number().min(0),
	accepted_edited_count: z.number().min(0),
});

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } },
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

		// Sprawdź autoryzację
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		// Parsuj i waliduj dane
		const body = await request.json();
		const validationResult = updateGenerationSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Validation error',
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		// Aktualizuj generację
		const { data: generation, error } = await supabase
			.from('generations')
			.update({
				status: validationResult.data.status,
				accepted_unedited_count:
					validationResult.data.accepted_unedited_count,
				accepted_edited_count:
					validationResult.data.accepted_edited_count,
				updated_at: new Date().toISOString(),
			})
			.eq('id', params.id)
			.eq('user_id', user.id)
			.select()
			.single();

		if (error) {
			console.error('Error updating generation:', error);
			return NextResponse.json(
				{ error: 'Failed to update generation' },
				{ status: 500 },
			);
		}

		return NextResponse.json(generation);
	} catch (error) {
		console.error('Error in PATCH /api/generations/[id]:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
