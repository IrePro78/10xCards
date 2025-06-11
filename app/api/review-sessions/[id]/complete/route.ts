import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ReviewService } from '@/lib/review.service';

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

		const reviewService = new ReviewService(supabase);
		await reviewService.completeSession(resolvedParams.id);

		return NextResponse.json({
			message: 'Session completed successfully',
		});
	} catch (error) {
		console.error('Error completing review session:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
