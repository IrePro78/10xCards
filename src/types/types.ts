/**
 * Definicje DTO i Command Modeli dla API aplikacji.
 *
 * W poniższych definicjach wykorzystujemy referencje do typów wygenerowanych z bazy danych, zdefiniowanych w pliku @database.types.ts.
 * Wszystkie DTO i modele komend odnoszą się do encji bazy danych:
 *  - flashcards
 *  - generations
 *  - generation_error_logs
 *
 * Używamy m.in. narzędzi TypeScript takich jak Omit, Pick, Partial aby precyzyjnie odzwierciedlić wymagania API.
 */

// Importujemy typy wygenerowane z bazy danych
import type { Database } from '@/db/database.types';

// ==========================
// Typy dla Flashcards
// ==========================

// Typ reprezentujący pełny wiersz encji flashcards z bazy
export type FlashcardDto =
	Database['public']['Tables']['flashcards']['Row'];

// Typ reprezentujący skrócony widok flashcard (dla listy)
export type FlashcardListDto = Pick<
	FlashcardDto,
	'id' | 'front' | 'back' | 'source' | 'created_at' | 'updated_at'
>;

// Command Model dla tworzenia flashcard
// Wykorzystujemy typ Insert z tabeli flashcards i usuwamy pola automatycznie generowane
export type CreateFlashcardCommandDto = Omit<
	Database['public']['Tables']['flashcards']['Insert'],
	'created_at' | 'id' | 'updated_at' | 'user_id'
>;

// Command Model dla aktualizacji flashcard
export type UpdateFlashcardCommandDto = Partial<
	Pick<FlashcardDto, 'front' | 'back'>
>;

// Opakowanie żądania tworzenia flashcards - zawiera tablicę nowych fiszek
export type CreateFlashcardsRequestDto = {
	flashcards: CreateFlashcardCommandDto[];
};

// Odpowiedź dla tworzenia flashcards (pełne dane fiszki)
export type CreateFlashcardsResponseDto = {
	flashcards: FlashcardDto[];
};

// Odpowiedź dla aktualizacji flashcard (zawiera identyfikator, front, back i datę aktualizacji)
export type UpdateFlashcardResponseDto = Pick<
	FlashcardDto,
	'id' | 'front' | 'back' | 'updated_at'
>;

// Opakowanie odpowiedzi dla listy flashcards z paginacją
export type FlashcardsListResponseDto = {
	flashcards: FlashcardListDto[];
	pagination: PaginationDto;
};

// Typ dla parametrów zapytania listy fiszek (surowe stringi z URL)
export type FlashcardsQueryParams = {
	page?: string;
	per_page?: string;
	search?: string;
	sort?: 'created_at' | 'updated_at' | 'front' | 'back';
};

// Odpowiedź dla usunięcia flashcard
export type DeleteFlashcardResponseDto = {
	message: string;
};

// Typ dla walidacji parametru id
export type FlashcardIdParams = {
	id: string;
};

// ==========================
// Typy dla Generations
// ==========================

// Typ reprezentujący pełny wiersz encji generations z bazy
export type GenerationDto =
	Database['public']['Tables']['generations']['Row'];

// Command Model dla tworzenia sesji generacji (AI) - przyjmuje jedynie tekst źródłowy
export type CreateGenerationCommandDto = {
	source_text: string; // wartość powinna mieć długość od 1000 do 10000 znaków
};

// Typ dla kandydujących fiszek zwracanych w odpowiedzi na generację (wersja uproszczona)
export type GenerationCandidateDto = {
	front: string;
	back: string;
	isEdited?: boolean;
};

// Typ dla kandydujących fiszek pobieranych przez GET /generations/{id}/flashcards
export type CandidateFlashcardDto = {
	front: string;
	back: string;
	source: string;
	created_at: string;
};

// Rozszerzony typ Generation z dołączonymi kandydatami fiszek
export type GenerationWithCandidatesDto = GenerationDto & {
	candidate_flashcards: GenerationCandidateDto[];
};

// Odpowiedź dla pobrania kandydujących fiszek powiązanych z sesją generacji
export type GenerationFlashcardsResponseDto = {
	flashcards: CandidateFlashcardDto[];
};

// ==========================
// Typy dla Generation Error Logs
// ==========================

// Typ reprezentujący pełny wiersz encji generation_error_logs z bazy
export type GenerationErrorLogDto =
	Database['public']['Tables']['generation_error_logs']['Row'];

// Opakowanie odpowiedzi dla listy logów błędów z paginacją
export type GenerationErrorLogsListResponseDto = {
	error_logs: GenerationErrorLogDto[];
	pagination: PaginationDto;
};

// ==========================
// Typy wspierające (Pagination)
// ==========================

// Definicja DTO dla paginacji używanej w listach
export type PaginationDto = {
	page: number;
	per_page: number;
	total_pages: number;
	total_items: number;
};
