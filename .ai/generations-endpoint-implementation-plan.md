# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Endpoint ten służy do inicjacji sesji generacji AI poprzez przesłanie tekstu źródłowego (source_text). Po walidacji tekstu, system wywołuje logikę AI do przetworzenia treści, tworzy rekord w tabeli `generations` oraz zwraca kandydatów na fiszki dla dalszej weryfikacji przez użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /generations
- **Parametry:**
  - **Body (JSON):**
    - *Obowiązkowy:* `source_text` (string) – tekst źródłowy o długości od 1000 do 10000 znaków

**Przykład request body:**
```json
{
  "source_text": "przykładowy tekst, który musi mieć co najmniej 1000 znaków..."
}
```

## 3. Wykorzystywane typy (DTO i Command Modele)
- **GenerationCreationDTO:**
  - Pola: `source_text`
- **GenerationResponseDTO:**
  - Pola: `id` (uuid), `user_id` (uuid), `model` (string), `generated_count` (integer), `accepted_unedited_count` (integer), `accepted_edited_count` (integer), `source_text_hash` (string), `source_text_length` (integer), `generation_duration` (integer lub null), `created_at` (timestamp), `updated_at` (timestamp), `candidate_flashcards` (lista obiektów z polami `front` i `back`)
- **Walidacja:** Schemat walidacji (np. Zod) definiowany zgodnie z referencjami do definicji typów (@types) oraz zasadami z @backend.mdc i @shared.mdc.

## 4. Szczegóły odpowiedzi
- **Kod sukcesu:** 201 Created
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
    { "front": "przykładowy front", "back": "przykładowy back" }
  ]
}
```
- **Błędy:**
  - 400 Bad Request – nieprawidłowe dane wejściowe (np. zła długość tekstu)
  - 401 Unauthorized – brak autoryzacji
  - 500 Internal Server Error – błędy wewnętrzne, np. podczas przetwarzania AI lub operacji na bazie danych

## 5. Przepływ danych
1. Klient wysyła żądanie POST na `/generations` z polem `source_text` w ciele żądania.
2. Warstwa kontrolera autoryzuje użytkownika na podstawie JWT (Supabase Auth) oraz weryfikuje zgodność z RLS.
3. Żądanie trafia do warstwy service, np. `GenerationService`, gdzie:
   - Walidowana jest długość `source_text` (min 1000, max 10000 znaków).
   - Obliczany jest hash tekstu oraz jego długość.
   - Inicjowana jest sesja przetwarzania AI (wywołanie odpowiedniego modułu/serwisu zewnętrznego) w celu wygenerowania kandydatów na fiszki.
   - Tworzony jest rekord w tabeli `generations` powiązany z aktualnym użytkownikiem.
   - W przypadku niepowodzenia przetwarzania AI, błąd jest logowany w tabeli `generation_error_logs`.
4. Wynik operacji (dane wygenerowane przez AI oraz dane rekordu) jest zwracany do kontrolera, a następnie jako odpowiedź JSON do klienta.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Użycie Supabase Auth oraz RLS w tabelach `users`, `generations`, `flashcards` i `generation_error_logs` zapewnia, że użytkownik ma dostęp tylko do swoich danych.
- **Walidacja wejścia:** Dokładna walidacja `source_text` zapewniająca, że jego długość mieści się w wymaganym zakresie, eliminuje potencjalne ataki poprzez nieprawidłowe dane wejściowe.
- **Bezpieczeństwo danych:** Przed zapisaniem, obliczany jest hash tekstu źródłowego, co pozwala na weryfikację integralności danych.
- **Logowanie błędów:** W przypadku błędów przetwarzania AI, błędy są rejestrowane w tabeli `generation_error_logs`.

## 7. Obsługa błędów
- **400 Bad Request:** Walidacja tekstu źródłowego nie spełnia wymagań (długość poniżej 1000 lub powyżej 10000 znaków).
- **401 Unauthorized:** Użytkownik nie przeszedł autoryzacji lub token JWT jest nieprawidłowy.
- **500 Internal Server Error:** Błąd po stronie serwera, np. problem z przetwarzaniem AI, błąd w interakcji z bazą danych.

## 8. Rozważania dotyczące wydajności
- Wstępna walidacja danych wejściowych przed przeprowadzeniem kosztownych operacji (np. wywołanie modułu AI).
- Użycie indeksów w tabelach, szczególnie `generations` i `users`, dla szybkiego zapisu i pobierania danych.
- Asynchroniczne wywołanie zewnętrznych serwisów AI, jeśli przetwarzanie może być długotrwałe, aby nie blokować odpowiedzi API.
- Monitorowanie wydajności i obciążenia w celu skalowania usług w razie potrzeby.

## 9. Etapy wdrożenia
1. **Definicja typów i walidacja:**
   - Utworzenie DTO: `GenerationCreationDTO` oraz `GenerationResponseDTO` wykorzystujących definicje z @types (odwołanie do pliku @database.types.ts).
   - Implementacja walidacji wejścia przy użyciu Zod lub innej biblioteki walidacyjnej, zgodnie z wytycznymi z @backend.mdc.
2. **Implementacja warstwy serwisowej:**
   - Utworzenie `GenerationService` odpowiedzialnego za logikę biznesową, w tym walidację wejścia, wywołanie przetwarzania AI, obliczenia hash, oraz tworzenie rekordu w tabeli `generations`.
   - Integracja mechanizmu logowania błędów do tabeli `generation_error_logs` w przypadku wystąpienia problemów podczas wywołania AI.
3. **Implementacja kontrolera endpointu:**
   - Utworzenie kontrolera (np. w ramach Next.js API routes lub odpowiedniego frameworka backendowego) obsługującego żądania POST na `/generations`.
   - Autoryzacja użytkownika oraz przekazanie danych do `GenerationService`.
   - Obsługa odpowiedzi: zwracanie 201 Created lub odpowiednich kodów błędów zgodnie z opisem.
4. **Integracja z Supabase:**
   - Zapewnienie, że operacje na bazie danych są zgodne z politykami RLS zdefiniowanymi w bazie.
   - Testy integracyjne w środowisku z autoryzacją i uwierzytelnianiem użytkownika.
5. **Testowanie:**
   - Przeprowadzenie testów jednostkowych i integracyjnych dla walidacji, logiki biznesowej oraz obsługi błędów.
   - Symulacja różnych scenariuszy (poprawne dane, niepoprawne dane, błędy AI, brak autoryzacji).
6. **Dokumentacja i monitoring:**
   - Aktualizacja dokumentacji API (np. Swagger) z opisem endpointu.
   - Wdrożenie mechanizmów monitorujących wydajność i logi błędów. 