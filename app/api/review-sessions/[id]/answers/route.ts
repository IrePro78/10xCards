import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ReviewService } from '@/lib/review.service';
import { z } from 'zod';

const answerSchema = z.object({
	flashcard_id: z.string().uuid(),
	quality: z.number().min(1).max(5),
	response_time_ms: z.number().min(0),
});

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const resolvedParams = await params;
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

		const body = await request.json();
		const validatedBody = answerSchema.parse(body);

		const reviewService = new ReviewService(supabase);
		await reviewService.saveAnswer(
			resolvedParams.id,
			validatedBody.flashcard_id,
			validatedBody.quality,
			validatedBody.response_time_ms,
		);

		return NextResponse.json({
			message: 'Answer saved successfully',
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 },
			);
		}

		console.error('Error saving review answer:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
