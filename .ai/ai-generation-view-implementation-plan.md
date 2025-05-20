# Plan implementacji widoku generowania fiszek przez AI

## 1. Przegląd

Widok umożliwia użytkownikowi wprowadzenie tekstu (od 1000 do 10000 znaków) celem wygenerowania przez AI kandydatów na fiszki. Po otrzymaniu wyników, użytkownik może przejść do etapu recenzji, gdzie ma możliwość zaakceptowania, edycji lub odrzucenia poszczególnych fiszek. Głównym celem widoku jest usprawnienie procesu tworzenia fiszek poprzez automatyzację generowania ich treści oraz umożliwienie manualnej korekty wyników przez użytkownika.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów

Hierarchia komponentów:

- **AIGenerationView** (główny kontener widoku)
  - **TextInputArea** – komponent odpowiedzialny za wprowadzanie tekstu źródłowego.
  - **GenerateButton** – przycisk inicjujący akcję generacji.
  - **SkeletonLoader** – komponent wyświetlający stan ładowania podczas komunikacji z API.
  - **FlashcardList** – lista wyświetlająca wygenerowane kandydatów na fiszki.
  - **FlashcardItem** – pojedynczy element listy, zawierający wyświetlanie treści fiszki oraz przyciski akcji (akceptacja, edycja, odrzucenie).
  - **BulkSaveButton** – przycisk do zbiorczego zapisu zaakceptowanych fiszek.
  - **ErrorMessage** – komponent do wyświetlania komunikatów o błędach i walidacji.

## 4. Szczegóły komponentów

### AIGenerationView

- **Opis**: Główny komponent widoku, który zarządza stanem całego procesu generacji i recenzji fiszek.
- **Elementy**:
  - Pole tekstowe (TextInputArea) z walidacją długości (min. 1000, max. 10000 znaków).
  - Przycisk (GenerateButton) do wysłania tekstu do endpointu POST /generations.
  - Lista wyników (FlashcardList) prezentująca zwrócone przez API kandydaty fiszek.
  - Komponent SkeletonLoader wyświetlany podczas oczekiwania na odpowiedź z API.
  - Przycisk (BulkSaveButton) do zbiorczego zapisu zaakceptowanych fiszek.
  - Komponent ErrorMessage wyświetlający ewentualne błędy.
- **Obsługiwane zdarzenia**: wprowadzenie tekstu, kliknięcie przycisku do wysłania, akcje w obrębie poszczególnych fiszek (akceptacja, edycja, odrzucenie).
- **Walidacja**: Sprawdzenie, czy długość wprowadzanego tekstu mieści się w zadanym zakresie.
- **Typy**: Wykorzystanie DTO `GenerationDto` oraz `GenerationCandidateDto` z pliku @types.ts, uzupełnione o dodatkowy model view: `AIGenerationViewModel` (pola: sourceText, candidateFlashcards, isLoading, error).

### TextInputArea

- **Opis**: Pole do wprowadzania tekstu źródłowego dla generacji fiszek.
- **Elementy**: Input typu textarea, etykieta, komunikat walidacyjny.
- **Obsługiwane zdarzenia**: onChange, onBlur.
- **Walidacja**: Długość wprowadzanego tekstu (min. 1000 i max. 10000 znaków).
- **Typy**: `string` dla tekstu, ewentualnie lokalny typ walidacji.

### GenerateButton

- **Opis**: Przycisk wysyłający dane do endpointu POST /generations.
- **Elementy**: HTML button, może zawierać ikonę ładowania.
- **Obsługiwane zdarzenia**: onClick wywołujące funkcję wysyłki danych.
- **Walidacja**: Przycisk aktywny tylko, gdy tekst spełnia kryteria walidacyjne.

### FlashcardList i FlashcardItem

- **Opis FlashcardList**: Kontener renderujący listę kandydatów na fiszki.
- **Opis FlashcardItem**: Każdy element listy wyświetla treść fiszki (front i back) i pozwala na wykonanie akcji:
  - **Akceptacja**: Wywołanie endpointu POST /flashcards z danymi fiszki.
  - **Edycja**: Umożliwienie modyfikacji treści fiszki (otwarcie modala edycyjnego).
  - **Odrzucenie**: Usunięcie fiszki z listy widoku.
- **Obsługiwane zdarzenia**: Kliknięcie przycisku akceptacji, edycji, odrzucenia.
- **Walidacja**: Sprawdzenie długości pól – front (max. 200 znaków) i back (max. 500 znaków) przed wysłaniem danych.
- **Typy**: `GenerationCandidateDto` z @types.ts.

### BulkSaveButton

- **Opis**: Przycisk umożliwiający zbiorcze zapisanie wszystkich zaakceptowanych fiszek.
- **Elementy**: HTML button, może zawierać ikonę zapisu oraz licznik zaakceptowanych fiszek.
- **Obsługiwane zdarzenia**: onClick wywołujące funkcję zbiorczego zapisu do endpointu POST /flashcards.
- **Walidacja**: Przycisk aktywny tylko gdy istnieje co najmniej jedna zaakceptowana fiszka.
- **Typy**: Wykorzystuje tablicę `GenerationCandidateDto` z @types.ts dla fiszek do zapisu.

### ErrorMessage

- **Opis**: Wyświetla komunikaty o błędach wynikających z walidacji lub odpowiedzi API.
- **Elementy**: Tekstowy komunikat błędu, stylizowany odpowiednio do designu aplikacji.
- **Obsługiwane zdarzenia**: Brak interakcji; tylko wyświetlanie treści.

## 5. Typy

Nowe typy i modele wymagane dla widoku:

- **AIGenerationViewModel**:
  - sourceText: string
  - candidateFlashcards: GenerationCandidateDto[]
  - isLoading: boolean
  - error: string | null

Integracja z istniejącymi typami:

- Wykorzystanie `GenerationDto` oraz `GenerationCandidateDto` z pliku @types.ts do modelowania odpowiedzi z API.

## 6. Zarządzanie stanem

- Użycie hooków React (useState, useEffect) do zarządzania stanem widoku.
- Stany: `sourceText`, `candidateFlashcards`, `isLoading`, `error`.
- Ewentualne utworzenie customowego hooka `useAIGeneration` do zarządzania logiką wysyłania danych, obsługi odpowiedzi API oraz aktualizacji stanu.

## 7. Integracja API

- **Endpoint POST /generations**:
  - Wysyłamy objekt: { source_text: string }.
  - Oczekujemy odpowiedzi zawierającej m.in. pole `candidate_flashcards` (tablica obiektów z polami front i back).
- **Endpoint POST /flashcards**:
  - Wywoływany przy akceptacji fiszki, wysyłamy dane pojedynczej fiszki (front, back, source, generation_id).
- Typy żądania i odpowiedzi zgodne z definicjami z @types.ts.

## 8. Interakcje użytkownika

- Użytkownik wpisuje tekst do pola TextInputArea.
- Po kliknięciu przycisku GenerateButton:
  - Walidacja tekstu – długość musi być zgodna z wymaganiami.
  - Wyświetlenie komponentu SkeletonLoader podczas oczekiwania na odpowiedź.
  - Po otrzymaniu odpowiedzi API – wyświetlenie listy FlashcardItem.
- Dla każdej fiszki:
  - Kliknięcie akceptacji powoduje oznaczenie fiszki jako zaakceptowanej.
  - Kliknięcie edycji otwiera modal umożliwiający zmianę treści fiszki, z ponownym sprawdzeniem walidacji.
  - Kliknięcie odrzucenia usuwa fiszkę z widoku.
- Kliknięcie BulkSaveButton:
  - Wysłanie wszystkich zaakceptowanych fiszek do endpointu POST /flashcards.
  - Wyświetlenie komunikatu o sukcesie po zapisie.
  - Usunięcie zapisanych fiszek z widoku.

## 9. Warunki i walidacja

- Walidacja na poziomie TextInputArea: sprawdzenie, czy tekst ma między 1000 a 10000 znaków.
- Przed wysłaniem danych do API – upewnienie się, że spełnione są wszystkie warunki walidacyjne.
- Dla edycji fiszki: długość pola front nie przekracza 200 znaków, a pola back 500 znaków.
- Pokaż komunikaty błędów za pomocą komponentu ErrorMessage, gdy walidacja nie przejdzie lub API zwróci błąd.

## 10. Obsługa błędów

- Jeżeli wywołanie API zakończy się niepowodzeniem, ustaw stan `error` i wyświetl odpowiedni komunikat w komponencie ErrorMessage.
- Błędy walidacyjne są wyświetlane bezpośrednio przy odpowiednich polach (np. TextInputArea dla tekstu źródłowego, modal edycyjny dla fiszek).
- Umożliwienie ponownego wysłania żądania po naprawieniu błędów.

## 11. Kroki implementacji

- 1. Utworzyć strukturę folderów i plików dla widoku, zgodnie ze standardami @shared.mdc. Widok powinien być umieszczony w katalogu `/app/generate` (w folderze `app` przechowywane są strony Next.js, zgodnie z wytycznymi).
- 2. Zaimplementować główny komponent AIGenerationView, zarządzający stanem oraz integracją API.
- 3. Stworzyć komponent TextInputArea z walidacją długości tekstu.
- 4. Zaimplementować GenerateButton, który wywołuje funkcję wysyłki danych do endpointu POST /generations.
- 5. Dodać obsługę stanu ładowania (SkeletonLoader) oraz wyświetlanie komunikatów błędów (ErrorMessage).
- 6. Po otrzymaniu odpowiedzi z API, przekazać dane do komponentu FlashcardList i renderować poszczególne FlashcardItem.
- 7. Zaimplementować akcje dla FlashcardItem: akceptacja, edycja (otwarcie modala) oraz odrzucenie.
- 8. Dodać komponent BulkSaveButton i zaimplementować logikę zbiorczego zapisu zaakceptowanych fiszek.
- 9. Przetestować widok pod kątem poprawności walidacji, obsługi stanów oraz integracji z API.
- 10. Dokonać poprawek oraz zoptymalizować kod, uwzględniając wytyczne @next_js.mdc oraz @shared.mdc.

---

Plan wdrożenia został przygotowany zgodnie z dokumentacją PRD, historyjkami użytkownika, opisami endpointów, definicjami typów oraz wskazówkami technologicznymi z dokumentu @tech-stack.md.
