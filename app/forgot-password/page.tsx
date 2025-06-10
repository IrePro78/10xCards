import { redirect } from 'next/navigation';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { createSupabaseServerClient } from '@/db/supabase.server';

export default async function ForgotPasswordPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect('/generate');
	}

	return (
		<div className="container flex min-h-screen items-center justify-center">
			<ForgotPasswordForm />
		</div>
	);
}
