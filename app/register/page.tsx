import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createSupabaseServerClient } from '@/db/supabase.server';

export default async function RegisterPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect('/generate');
	}

	return (
		<div className="container flex min-h-screen items-center justify-center">
			<RegisterForm />
		</div>
	);
}
