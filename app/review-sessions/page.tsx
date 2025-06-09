import { getUser } from '@/actions/auth';
import { ReviewSessionView } from './components/ReviewSessionView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ReviewSessionsPage() {
	const { user } = await getUser();

	if (!user) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<h2 className="text-2xl font-semibold">
							Zaloguj się aby rozpocząć
						</h2>
						<p className="text-muted-foreground mt-2">
							Musisz być zalogowany aby korzystać z systemu powtórek
						</p>
						<Link href="/login" className="mt-4 inline-block">
							<Button>Zaloguj się</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl py-8">
			<ReviewSessionView />
		</div>
	);
}
