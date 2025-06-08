'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { deleteAccount } from '@/actions/auth';

export function DeleteAccountForm() {
	const [isOpen, setIsOpen] = useState(false);
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password.trim()) {
			toast.error('Wprowadź hasło, aby potwierdzić usunięcie konta');
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append('password', password);

			const result = await deleteAccount(formData);

			if (result?.error) {
				console.error('Błąd z serwera:', result.error);
				toast.error(result.error);
			} else if (result?.success) {
				toast.success('Konto zostało usunięte');
				window.location.href = '/';
			}
		} catch (err) {
			console.error('Błąd podczas usuwania konta:', err);
			toast.error(
				'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
			);
		} finally {
			setIsLoading(false);
			setIsOpen(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-destructive text-xl font-semibold tracking-tight">
					Usuń konto
				</h2>
				<p className="text-muted-foreground text-sm">
					Ta operacja jest nieodwracalna. Wszystkie twoje dane zostaną
					trwale usunięte.
				</p>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button
						variant="destructive"
						className="h-12 w-full rounded-lg text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						Usuń konto
					</Button>
				</DialogTrigger>
				<DialogContent className="border-input bg-card text-card-foreground rounded-xl p-6 shadow-xl sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-card-foreground text-xl font-semibold">
							Czy na pewno chcesz usunąć konto?
						</DialogTitle>
						<p className="text-muted-foreground mt-2 text-sm">
							Ta operacja jest nieodwracalna. Wszystkie twoje dane, w
							tym fiszki i historia nauki, zostaną trwale usunięte.
						</p>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-card-foreground font-medium"
							>
								Wprowadź hasło, aby potwierdzić
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="border-input bg-card text-card-foreground hover:border-muted focus:border-ring h-12 rounded-lg text-[15px] transition-all focus:ring-0"
							/>
						</div>

						<DialogFooter className="mt-8 flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="h-10 min-w-[100px]"
							>
								Anuluj
							</Button>
							<Button
								variant="destructive"
								disabled={isLoading}
								className="h-10 min-w-[100px]"
							>
								{isLoading ? (
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : (
									'Usuń konto'
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
