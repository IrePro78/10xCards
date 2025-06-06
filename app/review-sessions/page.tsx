import { getUser } from '@/actions/auth';

export default async function ReviewSessionsPage() {
	const { user } = await getUser();

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="border-border rounded-xl border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-lg font-medium">Sesje powtórek</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Historia i statystyki twoich sesji powtórek
					</p>
				</div>
				<div className="p-6">
					<div className="text-muted-foreground flex min-h-[200px] items-center justify-center text-sm">
						Brak sesji powtórek do wyświetlenia
					</div>
				</div>
			</div>

			<div className="border-border rounded-xl border shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="text-lg font-medium">Statystyki</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Twoje postępy w nauce
					</p>
				</div>
				<div className="p-6">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div className="border-border rounded-lg border p-4">
							<div className="text-muted-foreground text-sm">
								Ukończone sesje
							</div>
							<div className="text-2xl font-bold">0</div>
						</div>
						<div className="border-border rounded-lg border p-4">
							<div className="text-muted-foreground text-sm">
								Powtórzone fiszki
							</div>
							<div className="text-2xl font-bold">0</div>
						</div>
						<div className="border-border rounded-lg border p-4">
							<div className="text-muted-foreground text-sm">
								Średni wynik
							</div>
							<div className="text-2xl font-bold">0%</div>
						</div>
						<div className="border-border rounded-lg border p-4">
							<div className="text-muted-foreground text-sm">
								Czas nauki
							</div>
							<div className="text-2xl font-bold">0min</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
