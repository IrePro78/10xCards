'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface DeleteAccountDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (password: string) => Promise<void>;
	isLoading: boolean;
}

export function DeleteAccountDialog({
	isOpen,
	onOpenChange,
	onConfirm,
	isLoading,
}: DeleteAccountDialogProps) {
	const [password, setPassword] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onConfirm(password);
		setPassword('');
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
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
							onClick={() => onOpenChange(false)}
							className="h-10 min-w-[100px] rounded-lg border-[1.5px] border-[#222222] bg-white text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
						>
							Anuluj
						</Button>
						<Button
							variant="outline"
							disabled={isLoading}
							className="h-10 min-w-[100px] rounded-lg border-[1.5px] border-[#FF385C] bg-[#FF385C] text-white transition-all hover:scale-[1.02] hover:border-[#E31C5F] hover:bg-[#E31C5F] active:scale-[0.98]"
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
	);
}
