'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteAccount } from '@/actions/auth';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export function DeleteAccountForm() {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirmDelete = async (password: string) => {
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

			<Button
				variant="outline"
				onClick={() => setIsOpen(true)}
				className="h-12 w-full rounded-lg border-[1.5px] border-[#FF385C] bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:border-[#E31C5F] hover:bg-[#E31C5F] active:scale-[0.98]"
			>
				Usuń konto
			</Button>

			<DeleteAccountDialog
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				onConfirm={handleConfirmDelete}
				isLoading={isLoading}
			/>
		</div>
	);
}
