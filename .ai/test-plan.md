<plan_testów>

# Plan testów dla projektu 10xCards

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie wysokiej jakości aplikacji 10xCards poprzez weryfikację poprawności implementacji, stabilności, wydajności oraz bezpieczeństwa. Testy pozwolą wcześnie wykrywać regresje, weryfikować integrację z Supabase i zapewnią zgodność z wymaganiami biznesowymi.

## 2. Zakres testów

- Frontend:
  - komponenty UI (Shadcn UI, Tailwind)
  - zachowanie App Router i Server Components
  - responsywność i dark mode
  - pages, layouty w `app/`
- Backend/API:
  - route handlers w `app/api`
  - integracja z Supabase (auth, baza danych, RLS)
  - walidacje Zod
- Migracje i baza danych:
  - skrypty w `supabase/migrations`
  - polityki RLS
- Integracja end-to-end:
  - pełne ścieżki użytkownika (rejestracja, logowanie, CRUD kart)
- Wydajność i bezpieczeństwo:
  - testy load, testy luk RLS

## 3. Typy testów do przeprowadzenia

1. Testy jednostkowe
   - logika walidacji Zod
   - pomocnicze funkcje w `src/lib`
2. Testy integracyjne
   - API route handlers z wykorzystaniem Supabase Test Helpers
   - migracje SQL na testowej instancji bazy
3. Testy end-to-end (E2E)
   - Cypress lub Playwright do symulacji interakcji w przeglądarce
4. Testy wydajnościowe
   - Lighthouse CI na kluczowych stronach
   - obciążeniowe zapytania do API
5. Testy bezpieczeństwa
   - sprawdzenie RLS w trybie “anon” vs “authenticated”
   - statyczna analiza zależności (`npm audit`)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

| Nr  | Funkcjonalność          | Scenariusz                                                  |
| --- | ----------------------- | ----------------------------------------------------------- |
| 1   | Rejestracja użytkownika | poprawne i błędne dane, walidacja Zod, komunikaty o błędach |
| 2   | Logowanie               | poprawne hasło, niepoprawne hasło, przekierowania           |
| 3   | Tworzenie karty         | formularz z wymaganymi polami, walidacja, zapis w bazie     |
| 4   | Edycja karty            | załadowanie danych, zapis zmian, powiadomienie o sukcesie   |
| 5   | Usuwanie karty          | potwierdzenie akcji, usunięcie w UI i w bazie               |
| 6   | Lista kart              | paginacja, filtrowanie, zamiana trybu dark/light            |
| 7   | Polityki RLS            | dostęp jako `anon` (tylko publiczne), `authenticated`       |

## 5. Środowisko testowe

- lokalny serwer Next.js w trybie testowym (`NODE_ENV=test`)
- baza Postgres uruchamiana przez Supabase CLI (`supabase start`)
- osobna instancja bazy do testów integracyjnych
- konteneryzacja z Docker (opcjonalnie)
- zmienne środowiskowe testowe w `.env.test`

## 6. Narzędzia do testowania

- JavaScript/TypeScript: Vitest + React Testing Library
- API: Supertest / Supabase Test Helpers
- E2E: Playwright
- Wydajność: Lighthouse CI
- Bezpieczeństwo: npm audit, zsqlcheck (analiza migracji)
- CI: GitHub Actions z pipeline testowym

## 7. Harmonogram testów

| Tydzień | Aktywność                                  |
| ------- | ------------------------------------------ |
| 1       | Konfiguracja środowiska, testy jednostkowe |
| 2       | Testy integracyjne dla API i migracji      |
| 3       | Scenariusze E2E i testy RLS                |
| 4       | Testy wydajności i bezpieczeństwa          |
| 5       | Podsumowanie wyników, raport końcowy       |

## 8. Kryteria akceptacji testów

- pokrycie testami > 85% linii krytycznej logiki
- zero błędów krytycznych (“blocker”) w scenariuszach kluczowych
- brak regresji w pipeline CI
- poprawne działanie RLS w trybach anon i authenticated

## 9. Role i odpowiedzialności w procesie testowania

- QA Engineer: opracowanie i uruchomienie testów, raportowanie
- Developer: naprawa defektów, wsparcie w konfiguracji środowiska
- Product Owner: akceptacja kryteriów i priorytetów testowych
- DevOps: utrzymanie pipeline CI/CD i środowisk testowych

## 10. Procedury raportowania błędów

1. Zgłaszanie defektów w systemie GitHub Issues ze szablonem:
   - tytuł, kroki, oczekiwane vs. rzeczywiste
   - priorytet i wpływ na użytkownika
2. Automatyczne powiadomienia na Slack kanał #qa
3. Cotygodniowe podsumowania statusu testów i otwartych defektów

</plan_testów>
