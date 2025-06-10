import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { createSupabaseServerClient } from '@/db/supabase.server';

export default async function ResetPasswordPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect('/generate');
	}

	return (
		<div className="container flex min-h-screen items-center justify-center">
			<ResetPasswordForm />
		</div>
	);
}
