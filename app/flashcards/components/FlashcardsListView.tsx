'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type {
	FlashcardListDto,
	FlashcardsListResponseDto,
} from '@/types/types';
import { EditFlashcardDialog } from '@/components/EditFlashcardDialog';
import { DeleteFlashcardDialog } from '@/components/DeleteFlashcardDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { ChangeEvent } from 'react';

interface FlashcardsListViewModel {
	flashcards: FlashcardListDto[];
	isLoading: boolean;
	error: string | null;
	search: string;
	sort: 'created_at' | 'updated_at' | 'front' | 'back';
	page: number;
	perPage: number;
	totalPages: number;
	totalItems: number;
}

export function FlashcardsListView() {
	const [viewModel, setViewModel] = useState<FlashcardsListViewModel>(
		{
			flashcards: [],
			isLoading: false,
			error: null,
			search: '',
			sort: 'created_at',
			page: 1,
			perPage: 10,
			totalPages: 0,
			totalItems: 0,
		},
	);

	const [editingFlashcard, setEditingFlashcard] =
		useState<FlashcardListDto | null>(null);
	const [deletingFlashcard, setDeletingFlashcard] =
		useState<FlashcardListDto | null>(null);

	const fetchFlashcards = async () => {
		try {
			setViewModel((prev) => ({
				...prev,
				isLoading: true,
				error: null,
			}));

			const searchParams = new URLSearchParams({
				page: viewModel.page.toString(),
				per_page: viewModel.perPage.toString(),
				sort: viewModel.sort,
			});

			if (viewModel.search) {
				searchParams.append('search', viewModel.search);
			}

			const response = await fetch(
				`/api/flashcards?${searchParams.toString()}`,
			);

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas pobierania fiszek');
			}

			const data: FlashcardsListResponseDto = await response.json();

			setViewModel((prev) => ({
				...prev,
				flashcards: data.flashcards,
				totalPages: data.pagination.total_pages,
				totalItems: data.pagination.total_items,
				isLoading: false,
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			setViewModel((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
			}));
			toast.error(errorMessage);
		}
	};

	const handleSearch = (value: string) => {
		setViewModel((prev) => ({
			...prev,
			search: value,
			page: 1,
		}));
	};

	const handleSort = (value: string) => {
		setViewModel((prev) => ({
			...prev,
			sort: value as 'created_at' | 'updated_at' | 'front' | 'back',
			page: 1,
		}));
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= viewModel.totalPages) {
			setViewModel((prev) => ({
				...prev,
				page: newPage,
			}));
		}
	};

	const handleEditFlashcard = (flashcard: FlashcardListDto) => {
		setEditingFlashcard(flashcard);
	};

	const handleSaveEdit = async (
		editedFlashcard: FlashcardListDto,
	) => {
		try {
			const response = await fetch(
				`/api/flashcards/${editedFlashcard.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						front: editedFlashcard.front,
						back: editedFlashcard.back,
					}),
				},
			);

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas aktualizacji fiszki');
			}

			toast.success('Fiszka została zaktualizowana');
			setEditingFlashcard(null);
			await fetchFlashcards(); // Refresh list
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			toast.error(errorMessage);
		}
	};

	const handleDeleteFlashcard = (flashcard: FlashcardListDto) => {
		setDeletingFlashcard(flashcard);
	};

	const handleConfirmDelete = async (flashcard: FlashcardListDto) => {
		try {
			const response = await fetch(
				`/api/flashcards/${flashcard.id}`,
				{
					method: 'DELETE',
				},
			);

			if (!response.ok) {
				throw new Error('Wystąpił błąd podczas usuwania fiszki');
			}

			toast.success('Fiszka została usunięta');
			setDeletingFlashcard(null);
			await fetchFlashcards(); // Refresh list
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Wystąpił nieznany błąd';
			toast.error(errorMessage);
		}
	};

	useEffect(() => {
		fetchFlashcards();
	}, [viewModel.search, viewModel.sort, viewModel.page]);

	return (
		<div className="space-y-6 rounded-xl p-6">
			<div className="flashcard-container bg-background overflow-hidden rounded-xl border shadow-sm">
				<div className="border-b px-6 py-4">
					<h2 className="text-foreground text-xl font-semibold">
						Twoje fiszki
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Lista wszystkich zapisanych fiszek
					</p>
				</div>
				<div className="p-6">
					<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
						<div className="relative w-full lg:max-w-[400px]">
							<Input
								type="text"
								placeholder="Szukaj w fiszkach..."
								value={viewModel.search}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handleSearch(e.target.value)
								}
								className="border-input bg-background hover:border-muted focus:border-foreground h-12 w-full rounded-lg pl-12 text-[15px] transition-all focus:ring-0"
							/>
							<Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
						</div>
						<div className="flex-shrink-0">
							<Select
								value={viewModel.sort}
								onValueChange={handleSort}
							>
								<SelectTrigger className="border-input bg-background hover:border-muted focus:border-foreground h-12 w-full min-w-[200px] rounded-lg text-[15px] transition-all focus:ring-0">
									<SelectValue placeholder="Sortuj po..." />
								</SelectTrigger>
								<SelectContent className="border-input rounded-lg">
									<SelectItem
										value="created_at"
										className="focus:bg-accent"
									>
										Data utworzenia
									</SelectItem>
									<SelectItem
										value="updated_at"
										className="focus:bg-accent"
									>
										Data aktualizacji
									</SelectItem>
									<SelectItem
										value="front"
										className="focus:bg-accent"
									>
										Przód
									</SelectItem>
									<SelectItem
										value="back"
										className="focus:bg-accent"
									>
										Tył
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{viewModel.error && (
						<div className="mb-6 rounded-lg bg-[#FFF8F9] p-4 text-[#FF385C]">
							{viewModel.error}
						</div>
					)}

					{viewModel.isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF385C] border-t-transparent"></div>
						</div>
					) : viewModel.flashcards.length > 0 ? (
						<>
							<div className="border-input relative overflow-x-auto rounded-xl border">
								<Table>
									<TableHeader>
										<TableRow className="border-input hover:bg-transparent">
											<TableHead className="bg-muted text-muted-foreground w-[300px] font-medium">
												Przód
											</TableHead>
											<TableHead className="bg-muted text-muted-foreground font-medium">
												Tył
											</TableHead>
											<TableHead className="bg-muted text-muted-foreground w-[150px] text-right font-medium">
												Data utworzenia
											</TableHead>
											<TableHead className="bg-muted text-muted-foreground sticky right-0 w-[200px] text-right font-medium">
												Akcje
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{viewModel.flashcards.map((flashcard) => (
											<TableRow
												key={flashcard.id}
												className="border-input hover:bg-accent/50"
											>
												<TableCell className="text-foreground font-medium">
													{flashcard.front}
												</TableCell>
												<TableCell className="group text-muted-foreground relative">
													<div className="absolute inset-0 overflow-hidden">
														<div className="truncate py-4 group-hover:overflow-x-auto group-hover:text-clip">
															{flashcard.back}
														</div>
													</div>
												</TableCell>
												<TableCell className="text-muted-foreground text-right">
													{new Date(
														flashcard.created_at,
													).toLocaleDateString('pl')}
												</TableCell>
												<TableCell className="sticky right-0 bg-inherit text-right">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEditFlashcard(flashcard)
															}
															className="border-foreground bg-background text-foreground hover:bg-accent h-8 rounded-lg border-2 px-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
														>
															Edytuj
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleDeleteFlashcard(flashcard)
															}
															className="bg-background h-8 rounded-lg border-2 border-[#FF385C] px-4 text-[#FF385C] transition-all hover:scale-[1.02] hover:bg-[#FFF8F9] active:scale-[0.98] dark:border-[#FF385C] dark:bg-transparent dark:text-[#FF385C] dark:hover:bg-[#FF385C]/10"
														>
															Usuń
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							<div className="mt-6 flex items-center justify-between">
								<div className="text-muted-foreground text-sm">
									Pokazano {viewModel.flashcards.length} z{' '}
									{viewModel.totalItems} fiszek
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handlePageChange(viewModel.page - 1)
										}
										disabled={viewModel.page === 1}
										className="border-foreground bg-background text-foreground hover:bg-accent disabled:border-muted disabled:text-muted-foreground h-8 w-8 rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<span className="text-muted-foreground min-w-[4rem] text-center text-sm">
										{viewModel.page} z {viewModel.totalPages}
									</span>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handlePageChange(viewModel.page + 1)
										}
										disabled={viewModel.page === viewModel.totalPages}
										className="border-foreground bg-background text-foreground hover:bg-accent disabled:border-muted disabled:text-muted-foreground h-8 w-8 rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					) : (
						<div className="py-8 text-center text-[#717171]">
							Nie znaleziono żadnych fiszek
						</div>
					)}
				</div>
			</div>

			<EditFlashcardDialog
				flashcard={editingFlashcard}
				isOpen={editingFlashcard !== null}
				onClose={() => setEditingFlashcard(null)}
				onSave={(flashcard) =>
					handleSaveEdit(flashcard as FlashcardListDto)
				}
			/>

			<DeleteFlashcardDialog
				flashcard={deletingFlashcard}
				isOpen={deletingFlashcard !== null}
				onClose={() => setDeletingFlashcard(null)}
				onDelete={(flashcard) =>
					handleConfirmDelete(flashcard as FlashcardListDto)
				}
			/>
		</div>
	);
}
