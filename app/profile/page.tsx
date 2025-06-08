import { getUser } from '@/actions/auth';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { DeleteAccountForm } from '@/components/auth/DeleteAccountForm';

export default async function ProfilePage() {
	const { user } = await getUser();

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="border-border rounded-xl border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-lg font-medium">Profil użytkownika</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Zarządzaj swoim kontem i ustawieniami
					</p>
				</div>
				<div className="p-6">
					<div className="space-y-4">
						<div className="grid gap-2">
							<h3 className="font-medium">Adres email</h3>
							<p className="text-muted-foreground text-sm">
								{user.email}
							</p>
						</div>
						{/* Tutaj będą dodatkowe sekcje profilu */}
					</div>
				</div>
			</div>

			<div className="border-border rounded-xl border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-lg font-medium">Bezpieczeństwo</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Zarządzaj hasłem i bezpieczeństwem konta
					</p>
				</div>
				<div className="p-6">
					<div className="space-y-6">
						<ChangePasswordForm />
						<hr className="border-border" />
						<DeleteAccountForm />
					</div>
				</div>
			</div>
		</div>
	);
}
