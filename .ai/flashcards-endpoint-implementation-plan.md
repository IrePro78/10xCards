/\*
API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Endpoint POST /flashcards umożliwia tworzenie nowych fiszek (flashcards) dla uwierzytelnionego użytkownika. Fiszka może pochodzić z ręcznego tworzenia lub być wynikiem generacji przez AI (opcjonalnie) – co determinuje obecność pola generation_id. Endpoint zapewnia walidację długości pól "front" (maks. 200 znaków) oraz "back" (maks. 500 znaków), a także przypisuje poprawne źródło (source) i powiązuje fiszkę z aktualnym użytkownikiem.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /flashcards
- **Parametry:**
  - **Wymagane:**
    - Request Body zawiera klucz "flashcards", reprezentujący tablicę obiektów fiszek. Każdy obiekt musi zawierać:
      - **front:** string (maksymalnie 200 znaków)
      - **back:** string (maksymalnie 500 znaków)
      - **source:** string (wartość 'manual' lub zgodnie z logiką: może być mapowane do 'user' w bazie danych)
  - **Opcjonalne:**
    - **generation_id:** UUID (opcjonalne, tylko dla fiszek generowanych przez AI)

## 3. Wykorzystywane typy

- **DTO i Command Modele:**
  - CreateFlashcardCommandDto
  - CreateFlashcardsRequestDto
  - FlashcardDto
  - CreateFlashcardsResponseDto

(Referencje do definicji typów znajdują się w pliku @types.ts)

## 4. Szczegóły odpowiedzi

- **Status 201 Created** – przy poprawnym utworzeniu fiszki.
- **Struktura odpowiedzi:** JSON obiekt zawierający klucz "flashcards", będący tablicą utworzonych fiszek. Każda fiszka zawiera:
  - id (uuid)
  - user_id (uuid)
  - front (string)
  - back (string)
  - source (string, np. 'user')
  - generation_id (uuid lub null)
  - created_at (timestamp)
  - updated_at (timestamp)

## 5. Przepływ danych

1. Żądanie trafia do endpointu POST /flashcards.
2. Middleware autentykacji sprawdza token JWT i ustawia dane użytkownika w kontekście.
3. Walidacja wejściowych danych przy użyciu biblioteki np. Zod – sprawdzenie długości pól oraz formatu generation_id.
4. Wywołanie serwisu odpowiedzialnego za tworzenie fiszek, który:
   - Przypisuje uzyskanego user_id do każdej fiszki.
   - Wykonuje walidację logiki biznesowej oraz wstawia dane do tabeli flashcards przy użyciu bezpiecznych, parametryzowanych zapytań SQL.
5. W przypadku powodzenia, serwis zwraca utworzone rekordy, które są przesyłane jako odpowiedź.

## 6. Względy bezpieczeństwa

- **Autentykacja i autoryzacja:** Endpoint dostępny wyłącznie dla uwierzytelnionych użytkowników. Użycie tokena JWT do weryfikacji tożsamości.
- **Walidacja danych:** Użycie schematów walidacyjnych (np. Zod) do sprawdzenia długości i formatu danych wejściowych, aby zapobiec błędom i atakom typu injection.
- **Bezpieczne wstawianie do bazy:** Użycie przygotowanych zapytań (prepared statements) w celu ochrony przed SQL Injection.

## 7. Obsługa błędów

- **400 Bad Request:** Zwracane gdy walidacja danych wejściowych nie powiedzie się (np. przekroczenie limitu znaków).
- **401 Unauthorized:** Brak prawidłowego tokenu autoryzacyjnego.
- **500 Internal Server Error:** W przypadku błędów po stronie serwera lub problemów z bazą danych.
- Logging błędów – ewentualnie można logować krytyczne błędy do dedykowanej tabeli logów (np. generation_error_logs), jeśli dotyczy.

## 8. Rozważania dotyczące wydajności

- **Batch Processing:** Możliwość tworzenia wielu fiszek w jednym żądaniu przy umiarkowanej liczbie elementów, by uniknąć nadużycia zasobów.
- **Indeksowanie:** Upewnienie się, że kolumna user_id jest odpowiednio zindeksowana, aby optymalizować operacje wstawiania i późniejsze wyszukiwanie.
- **Limit rozmiaru żądania:** Rozsądne ograniczenie liczby fiszek w pojedynczym żądaniu (np. maks. 50-100), aby zapobiec problemom wydajnościowym.

## 9. Etapy wdrożenia

1. **Walidacja żądania:** Implementacja schematu walidacji (np. Zod) dla request body.
2. **Middleware autentykacji:** Upewnienie się, że endpoint jest chroniony i poprawnie wyodrębnia user_id z tokena JWT.
3. **Implementacja serwisu:** Utworzenie lub rozszerzenie istniejącego serwisu (np. flashcards.service) do obsługi logiki wstawiania fiszek do bazy.
4. **Bezpieczne wstawianie do bazy:** Implementacja funkcji wykorzystującej parametryzowane zapytania SQL do wstawienia danych do tabeli flashcards.
5. **Obsługa odpowiedzi:** Zwrócenie poprawnie sformatowanego obiektu JSON zgodnie z definicją CreateFlashcardsResponseDto.
   \*/
