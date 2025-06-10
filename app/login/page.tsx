import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { createSupabaseServerClient } from '@/db/supabase.server';

export default async function LoginPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect('/generate');
	}

	return (
		<div className="container flex min-h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
