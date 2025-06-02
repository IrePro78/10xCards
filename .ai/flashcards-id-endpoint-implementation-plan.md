# API Endpoint Implementation Plan: Flashcards Resource by ID

## 1. Przegląd punktu końcowego

Ten plan obejmuje implementację trzech metod HTTP dla zasobu flashcards z parametrem `id`:

- **GET /flashcards/{id}** - Pobieranie szczegółów konkretnej fiszki
- **PUT /flashcards/{id}** - Aktualizacja istniejącej fiszki (front/back)
- **DELETE /flashcards/{id}** - Usunięcie fiszki

Wszystkie metody wymagają autentykacji użytkownika i weryfikacji własności zasobu. Endpoint zostanie zaimplementowany jako dynamic route w Next.js App Router.

## 2. Szczegóły żądania

### GET /flashcards/{id}

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/flashcards/[id]`
- **Parametry:**
  - Wymagane: `id` (UUID fiszki w URL)
- **Request Body:** Brak

### PUT /flashcards/{id}

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/flashcards/[id]`
- **Parametry:**
  - Wymagane: `id` (UUID fiszki w URL)
- **Request Body:**
  ```json
  {
  	"front": "string (opcjonalne, max 200 znaków)",
  	"back": "string (opcjonalne, max 500 znaków)"
  }
  ```

### DELETE /flashcards/{id}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/[id]`
- **Parametry:**
  - Wymagane: `id` (UUID fiszki w URL)
- **Request Body:** Brak

## 3. Wykorzystywane typy

### Istniejące typy (z `src/types/types.ts`):

- `FlashcardDto` - pełna fiszka (GET response)
- `UpdateFlashcardCommandDto` - dane aktualizacji (PUT request body)
- `UpdateFlashcardResponseDto` - odpowiedź aktualizacji (PUT response)

### Nowe typy do dodania:

```typescript
// Odpowiedź dla DELETE
export type DeleteFlashcardResponseDto = {
  message: string;
};

// Typ dla walidacji parametru id
export type FlashcardIdParams = {
  id: string;
};
```

## 4. Szczegóły odpowiedzi

### GET /flashcards/{id}

- **200 OK:**
  ```json
  {
  	"id": "uuid",
  	"user_id": "uuid",
  	"generation_id": "uuid lub null",
  	"front": "string",
  	"back": "string",
  	"source": "ai/ai-edited/manual",
  	"created_at": "timestamp",
  	"updated_at": "timestamp"
  }
  ```

### PUT /flashcards/{id}

- **200 OK:**
  ```json
  {
  	"id": "uuid",
  	"front": "string",
  	"back": "string",
  	"updated_at": "timestamp"
  }
  ```

### DELETE /flashcards/{id}

- **200 OK:**
  ```json
  {
  	"message": "Flashcard deleted successfully."
  }
  ```

## 5. Przepływ danych

### GET /flashcards/{id}

1. Walidacja parametru `id` (UUID)
2. Sprawdzenie autentykacji użytkownika
3. Pobranie fiszki z bazy danych przez `flashcardService.getFlashcardById()`
4. Weryfikacja własności zasobu (czy `user_id` fiszki == ID zalogowanego użytkownika)
5. Zwrócenie pełnych danych fiszki

### PUT /flashcards/{id}

1. Walidacja parametru `id` (UUID)
2. Sprawdzenie autentykacji użytkownika
3. Walidacja request body (długość front ≤200, back ≤500)
4. Pobranie istniejącej fiszki z bazy danych
5. Weryfikacja własności zasobu
6. Aktualizacja fiszki przez `flashcardService.updateFlashcard()`
7. Zwrócenie zaktualizowanych danych

### DELETE /flashcards/{id}

1. Walidacja parametru `id` (UUID)
2. Sprawdzenie autentykacji użytkownika
3. Pobranie fiszki z bazy danych (do weryfikacji istnienia i własności)
4. Weryfikacja własności zasobu
5. Usunięcie fiszki przez `flashcardService.deleteFlashcard()`
6. Zwrócenie komunikatu potwierdzającego

## 6. Względy bezpieczeństwa

### Autentykacja

- Użycie middleware Supabase dla sprawdzenia autentykacji
- Dostęp do klienta Supabase przez `context.locals.supabase`

### Autoryzacja

- Weryfikacja czy `user_id` fiszki odpowiada ID zalogowanego użytkownika
- Uniknięcie ujawnienia informacji o istnieniu zasobów innych użytkowników

### Walidacja danych

- Walidacja UUID dla parametru `id`
- Walidacja długości pól `front` i `back` (Zod schema)
- Sanityzacja danych wejściowych

### Rate limiting

- Rozważenie implementacji rate limiting dla operacji modyfikujących (PUT/DELETE)

## 7. Obsługa błędów

### Walidacja parametrów

- **400 Bad Request:** Nieprawidłowy format UUID, przekroczenie limitów długości pól
- **422 Unprocessable Entity:** Puste wymagane pola

### Autentykacja i autoryzacja

- **401 Unauthorized:** Brak ważnego tokenu autentykacji
- **403 Forbidden:** Użytkownik nie ma uprawnień do fiszki

### Zasoby

- **404 Not Found:** Fiszka nie istnieje lub nie należy do użytkownika

### Błędy serwera

- **500 Internal Server Error:** Błędy bazy danych, nieoczekiwane wyjątki

### Struktura odpowiedzi błędu

```json
{
	"error": "Error type",
	"message": "Detailed error message",
	"details": "Additional context (optional)"
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacja zapytań

- Pojedyncze zapytanie do bazy danych dla każdej operacji
- Indeks na kolumnie `id` (klucz główny) zapewnia szybkie wyszukiwanie

### Cachowanie

- Możliwość cachowania wyników GET dla często używanych fiszek
- Cache invalidation przy PUT/DELETE

### Minimalizacja transferu danych

- GET zwraca pełne dane tylko gdy potrzebne
- PUT zwraca jedynie zaktualizowane pola
- DELETE zwraca minimalną odpowiedź

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie typów

1. Dodać brakujące typy DTO do `src/types/types.ts`
2. Utworzyć schemat walidacji Zod dla UpdateFlashcardCommandDto

### Krok 2: Implementacja service layer

1. Utworzyć `src/lib/flashcardService.ts` z metodami:
   - `getFlashcardById(supabase: SupabaseClient, id: string, userId: string)`
   - `updateFlashcard(supabase: SupabaseClient, id: string, data: UpdateFlashcardCommandDto, userId: string)`
   - `deleteFlashcard(supabase: SupabaseClient, id: string, userId: string)`

### Krok 3: Implementacja route handler

1. Utworzyć `app/api/flashcards/[id]/route.ts`
2. Zaimplementować funkcje GET, PUT, DELETE
3. Dodać walidację parametrów i autoryzację

### Krok 4: Obsługa błędów

1. Zaimplementować centralizowaną obsługę błędów
2. Dodać odpowiednie kody statusu HTTP
3. Zapewnić spójny format odpowiedzi błędów

## 10. Dodatkowe uwagi implementacyjne

### Struktura plików

```
app/api/flashcards/[id]/
  └── route.ts

src/lib/
  └── flashcards.service.ts

src/types/
  └── types.ts (aktualizacja)
```
