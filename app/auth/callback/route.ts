import { createSupabaseServerClient } from '@/db/supabase.server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const next = requestUrl.searchParams.get('next') || '/generate';

	if (code) {
		const supabase = await createSupabaseServerClient();
		await supabase.auth.exchangeCodeForSession(code);
	}

	return NextResponse.redirect(new URL(next, request.url));
}
