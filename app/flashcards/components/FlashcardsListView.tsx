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
			<div className="flashcard-container overflow-hidden rounded-xl border bg-white shadow-sm">
				<div className="border-b px-6 py-4">
					<h2 className="text-xl font-semibold text-[#222222]">
						Twoje fiszki
					</h2>
					<p className="mt-1 text-sm text-[#717171]">
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
								className="h-12 w-full rounded-lg border-[#DDDDDD] bg-white pl-12 text-[15px] transition-all hover:border-[#717171] focus:border-[#222222] focus:ring-0"
							/>
							<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#717171]" />
						</div>
						<div className="flex-shrink-0">
							<Select
								value={viewModel.sort}
								onValueChange={handleSort}
							>
								<SelectTrigger className="h-12 w-full min-w-[200px] rounded-lg border-[#DDDDDD] bg-white text-[15px] transition-all hover:border-[#717171] focus:border-[#222222] focus:ring-0">
									<SelectValue placeholder="Sortuj po..." />
								</SelectTrigger>
								<SelectContent className="rounded-lg border-[#DDDDDD]">
									<SelectItem
										value="created_at"
										className="focus:bg-[#F7F7F7]"
									>
										Data utworzenia
									</SelectItem>
									<SelectItem
										value="updated_at"
										className="focus:bg-[#F7F7F7]"
									>
										Data aktualizacji
									</SelectItem>
									<SelectItem
										value="front"
										className="focus:bg-[#F7F7F7]"
									>
										Przód
									</SelectItem>
									<SelectItem
										value="back"
										className="focus:bg-[#F7F7F7]"
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
							<div className="relative overflow-x-auto rounded-xl border border-[#DDDDDD]">
								<Table>
									<TableHeader>
										<TableRow className="border-[#DDDDDD] hover:bg-transparent">
											<TableHead className="w-[300px] bg-[#F7F7F7] font-medium text-[#717171]">
												Przód
											</TableHead>
											<TableHead className="bg-[#F7F7F7] font-medium text-[#717171]">
												Tył
											</TableHead>
											<TableHead className="w-[150px] bg-[#F7F7F7] text-right font-medium text-[#717171]">
												Data utworzenia
											</TableHead>
											<TableHead className="sticky right-0 w-[200px] bg-[#F7F7F7] text-right font-medium text-[#717171]">
												Akcje
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{viewModel.flashcards.map((flashcard) => (
											<TableRow
												key={flashcard.id}
												className="border-[#DDDDDD] hover:bg-[#F7F7F7]"
											>
												<TableCell className="font-medium text-[#222222]">
													{flashcard.front}
												</TableCell>
												<TableCell className="group relative text-[#717171]">
													<div className="absolute inset-0 overflow-hidden">
														<div className="truncate py-4 group-hover:overflow-x-auto group-hover:text-clip">
															{flashcard.back}
														</div>
													</div>
												</TableCell>
												<TableCell className="text-right text-[#717171]">
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
															className="h-8 rounded-lg border-[#222222] bg-white px-4 text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]"
														>
															Edytuj
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleDeleteFlashcard(flashcard)
															}
															className="h-8 rounded-lg border-[#FF385C] bg-white px-4 text-[#FF385C] transition-all hover:scale-[1.02] hover:bg-[#FFF8F9] active:scale-[0.98]"
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
								<div className="text-sm text-[#717171]">
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
										className="h-8 w-8 rounded-lg border-[#222222] bg-white text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98] disabled:border-[#DDDDDD] disabled:text-[#DDDDDD]"
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<span className="min-w-[4rem] text-center text-sm text-[#717171]">
										{viewModel.page} z {viewModel.totalPages}
									</span>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handlePageChange(viewModel.page + 1)
										}
										disabled={viewModel.page === viewModel.totalPages}
										className="h-8 w-8 rounded-lg border-[#222222] bg-white text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98] disabled:border-[#DDDDDD] disabled:text-[#DDDDDD]"
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
