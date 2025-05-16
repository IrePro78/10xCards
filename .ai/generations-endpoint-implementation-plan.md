# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Endpoint służy do inicjowania sesji generacji fiszek przy użyciu AI. Po przesłaniu tekstu źródłowego (o długości od 1000 do 10000 znaków) system tworzy rekord w tabeli `generations` i rozpoczyna proces generacji kandydujących fiszek. Wynikiem jest zwrócenie danych sesji wraz z ewentualnymi kandydatami fiszek.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry:**
  - **Wymagane:**
    - Request Body: JSON z kluczem `source_text` (string, 1000-10000 znaków)
  - **Opcjonalne:** brak

## 3. Wykorzystywane typy

- **DTO i Command Modele:**
  - `CreateGenerationCommandDto` (definicja w @types) – zawiera pole: `source_text`.
  - `GenerationDto` (definicja w @types) – pełne dane sesji generacji.
  - `GenerationCandidateDto` (definicja w @types) – reprezentuje pojedynczego kandydata fiszki.
  - `GenerationWithCandidatesDto` (definicja w @types) – rozszerzony typ sesji generacji z dołączonymi kandydatami.

## 4. Szczegóły odpowiedzi

- **Kod odpowiedzi:**
  - 201 Created – sesja generacji została pomyślnie utworzona.
- **Struktura odpowiedzi (przykład):**
  ```json
  {
  	"id": "uuid",
  	"user_id": "uuid",
  	"model": "nazwa_modelu",
  	"generated_count": 0,
  	"accepted_unedited_count": 0,
  	"accepted_edited_count": 0,
  	"source_text_hash": "hash",
  	"source_text_length": 1234,
  	"generation_duration": null,
  	"created_at": "timestamp",
  	"updated_at": "timestamp",
  	"candidate_flashcards": [
  		{
  			"front": "przykładowy tekst",
  			"back": "przykładowa odpowiedź"
  		}
  	]
  }
  ```
- **Inne kody statusu:**
  - 400 Bad Request – błędne dane wejściowe (np. nieodpowiednia długość `source_text`)
  - 401 Unauthorized – brak autoryzacji
  - 500 Internal Server Error – błąd po stronie serwera

## 5. Przepływ danych

1. Klient wysyła żądanie POST do `/generations` z ciałem zawierającym `source_text`.
2. Middleware autoryzacji weryfikuje token JWT i ustala `user_id`.
3. Warstwa walidacji (np. Zod) sprawdza, czy `source_text` spełnia wymagania dotyczące długości.
4. Warstwa serwisowa:
   - Tworzy rekord w tabeli `generations` zgodnie z danymi użytkownika (wg RLS z @db-plan.md).
   - Inicjuje asynchroniczny proces generacji fiszek przy użyciu zewnętrznego API AI (jeśli dotyczy).
5. W przypadku błędów, rejestrowane są wpisy w tabeli `generation_error_logs`.
6. Ostatecznie, endpoint zwraca dane utworzonej sesji generacji wraz z ewentualnymi kandydatami fiszek.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Wymagany poprawny token JWT; dostęp tylko do własnych zasobów dzięki politykom RLS (zgodne z @db-plan.md).
- **Walidacja danych:** Sprawdzenie długości `source_text` (1000-10000 znaków) przed dalszym przetwarzaniem.
- **Ochrona przed nadużyciami:** Ograniczenie rozmiaru wejścia oraz logika zabezpieczająca przed SQL Injection.

## 7. Obsługa błędów

- **Błędy walidacji:**
  - 400 Bad Request, gdy `source_text` nie spełnia wymagań długości.
- **Błędy autoryzacji:**
  - 401 Unauthorized, gdy token jest nieprawidłowy lub nieobecny.
- **Błędy serwera:**
  - 500 Internal Server Error w przypadku nieoczekiwanych wyjątków.
- **Logowanie błędów:**
  - Błędy zapisywane w tabeli `generation_error_logs` (informacje o modelu, hashu tekstu źródłowego, komunikat błędu).

## 8. Rozważania dotyczące wydajności

- Indeksowanie kluczowych pól w bazie danych (np. `user_id`, `created_at`) w celu szybkiego przetwarzania zapytań.
- Asynchroniczne przetwarzanie generacji AI, aby nie blokować odpowiedzi dla klienta.
- Monitorowanie obciążenia serwera oraz skalowanie w razie potrzeby.

## 9. Etapy wdrożenia

1. Zdefiniowanie trasy (route) dla endpointu POST `/generations` w projekcie backendowym.
2. Implementacja middleware autoryzującego żądania i ekstrakcji `user_id` z tokena JWT.
3. Dodanie walidacji wejściowego `source_text` (np. przy użyciu Zod) w kontrolerze.
4. Utworzenie lub rozszerzenie warstwy serwisowej (np. generations.service) odpowiedzialnej za:
   - Tworzenie rekordu w tabeli `generations`.
   - Inicjowanie procesu asynchronicznej generacji fiszek przez AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
5. Implementacja mechanizmu logowania błędów do tabeli `generation_error_logs`.
6. Integracja operacji z bazą danych według zasad @db-plan.md (RLS, relacje między tabelami).
