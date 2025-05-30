# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Endpoint GET /flashcards służy do pobierania paginowanej listy fiszek należących do zalogowanego użytkownika. Obsługuje opcjonalne wyszukiwanie w treści fiszek oraz sortowanie według wybranych kryteriów. Jest to kluczowy endpoint do wyświetlania biblioteki fiszek użytkownika w interfejsie aplikacji.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/flashcards`
- **Parametry:**
  - **Opcjonalne:**
    - `page` (number, default: 1) - numer strony
    - `per_page` (number, default: 10, max: 100) - liczba elementów na stronę
    - `search` (string, optional) - fraza wyszukiwania w polach front/back
    - `sort` (string, default: 'created_at') - kolumna sortowania (created_at, updated_at, front, back)
- **Request Body:** Brak
- **Headers:** Authorization wymagany (Bearer token)

## 3. Wykorzystywane typy

```typescript
// Z pliku src/types/types.ts
- FlashcardListDto - reprezentuje pojedynczą fiszkę w liście
- FlashcardsListResponseDto - struktura odpowiedzi z paginacją
- PaginationDto - informacje o paginacji
```

**Dodatkowe typy do utworzenia:**

```typescript
// Query parameters validation schema
type FlashcardsQueryParams = {
	page?: number;
	per_page?: number;
	search?: string;
	sort?: 'created_at' | 'updated_at' | 'front' | 'back';
};
```

## 4. Szczegóły odpowiedzi

**Success Response (200 OK):**

```json
{
	"flashcards": [
		{
			"id": "uuid",
			"front": "string",
			"back": "string",
			"source": "ai|user",
			"created_at": "2024-01-01T12:00:00Z",
			"updated_at": "2024-01-01T12:00:00Z"
		}
	],
	"pagination": {
		"page": 1,
		"per_page": 10,
		"total_pages": 5,
		"total_items": 50
	}
}
```

**Error Responses:**

- **401 Unauthorized** - brak lub nieprawidłowy token autoryzacji
- **400 Bad Request** - nieprawidłowe parametry zapytania
- **500 Internal Server Error** - błąd serwera/bazy danych

## 5. Przepływ danych

1. **Weryfikacja autoryzacji** - middleware sprawdza token i ustawia user_id w context.locals
2. **Walidacja parametrów** - sprawdzenie poprawności query parameters
3. **Pobranie fiszek z bazy** - wykonanie zapytania SQL z filtrowaniem, wyszukiwaniem i sortowaniem
4. **Obliczenie paginacji** - COUNT query dla total_items
5. **Formatowanie odpowiedzi** - mapowanie wyników na FlashcardsListResponseDto
6. **Zwrócenie odpowiedzi** - JSON response z kodem 200

**SQL Query Structure:**

```sql
SELECT id, front, back, source, created_at, updated_at
FROM flashcards
WHERE user_id = $1
  AND (front ILIKE $2 OR back ILIKE $2) -- jeśli search
ORDER BY {sort_column} {direction}
LIMIT $3 OFFSET $4
```

## 6. Względy bezpieczeństwa

1. **Autentykacja:** Wymagany Bearer token w header Authorization
2. **Autoryzacja:** Filtrowanie tylko fiszek zalogowanego użytkownika (user_id)
3. **Walidacja parametrów:**
   - page: liczba > 0
   - per_page: 1 ≤ x ≤ 100
   - sort: whitelist dozwolonych kolumn
   - search: sanityzacja przeciwko SQL injection
4. **Rate Limiting:** Implementacja limitów dla zapobiegania DoS
5. **SQL Injection Prevention:** Używanie parameterized queries
6. **Data Exposure Prevention:** Zwracanie tylko dozwolonych pól (bez user_id, generation_id)

## 7. Obsługa błędów

| Kod | Scenariusz                                                            | Obsługa                                            |
| --- | --------------------------------------------------------------------- | -------------------------------------------------- |
| 400 | Nieprawidłowe parametry (page < 1, per_page > 100, niedozwolone sort) | Walidacja Zod + szczegółowy komunikat błędu        |
| 401 | Brak tokenu, nieprawidłowy token, wygasły token                       | Middleware autoryzacji + redirect do login         |
| 500 | Błąd połączenia z bazą, timeout, constraint violation                 | Logging błędu + generyczny komunikat użytkownikowi |

**Error Response Format:**

```json
{
	"error": "Validation failed",
	"message": "Parameter 'page' must be greater than 0",
	"details": {
		"field": "page",
		"value": 0,
		"constraint": "min:1"
	}
}
```

## 8. Rozważania dotyczące wydajności

1. **Indeksy bazodanowe:**

   **Istniejące indeksy** (już utworzone w migracji):

   - `flashcards_user_id_idx` - dla filtrowania po user_id
   - `flashcards_created_at_idx` - dla sortowania po created_at
   - `flashcards_next_review_at_idx` - dla funkcji spaced repetition
   - `flashcards_user_id_status_idx` - composite index dla user_id i status

   **Wymagane nowe indeksy** (do utworzenia w nowej migracji):

   - `CREATE INDEX idx_flashcards_search ON flashcards USING gin(to_tsvector('english', front || ' ' || back))` - dla wyszukiwania full-text

2. **Optymalizacje:**
   - Limit per_page maksymalnie 100 elementów
   - Wykorzystanie istniejących indeksów dla sortowania i filtrowania
   - Cursor-based pagination dla dużych zbiorów (przyszła implementacja)
   - Cache'owanie częstych zapytań (Redis w przyszłości)

## 9. Etapy wdrożenia

### Krok 1: Aktualizacja typów i validacji

- Dodanie typu `FlashcardsQueryParams` do `src/types/types.ts`
- Utworzenie schema walidacji Zod dla query parameters w `src/lib/validations/flashcards.schema.ts`

### Krok 2: Rozszerzenie istniejącego service

**Uwaga:** `FlashcardsService` już istnieje w `src/lib/flashcards.service.ts`

Wymagane modyfikacje:

```typescript
// Rozszerzenie istniejącej metody getFlashcards
async getFlashcards(
  userId: string,
  params: FlashcardsQueryParams
): Promise<FlashcardsListResponseDto>

// Dodanie metody pomocniczej dla zliczania
async getFlashcardsCount(
  userId: string,
  search?: string
): Promise<number>
```

### Krok 3: Dodanie metody GET do istniejącego route handler

**Uwaga:** Route handler już istnieje w `/app/api/flashcards/route.ts` z metodą POST

Wymagane modyfikacje:

- Dodanie metody `export async function GET(request: Request)`
- Dodanie i użycie schema walidacji
- Obsługa błędów zgodna z istniejącym kodem

### Krok 4: Utworzenie migracji dla indeksu wyszukiwania

- Nowa migracja: `YYYYMMDDHHMMSS_add_flashcards_search_index.sql`
- Dodanie GIN index dla full-text search

**Pliki do zmodyfikowania:**

1. **Istniejące pliki do rozszerzenia:**

   - `/app/api/flashcards/route.ts` - dodanie metody GET
   - `/src/lib/flashcards.service.ts` - rozszerzenie istniejącej metody

2. **Nowe pliki do utworzenia:**

   - `/supabase/migrations/YYYYMMDDHHMMSS_add_flashcards_search_index.sql` - indeks wyszukiwania

3. **Pliki do aktualizacji:**
   - `/src/types/types.ts` - dodanie typu FlashcardsQueryParams
