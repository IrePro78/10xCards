# Architektura UI dla 10xCards

## 1. Przegląd struktury UI

System frontend oparty na Next.js i wykorzystujący komponenty shadcn/ui oraz Tailwind CSS, umożliwiający responsywną i dostępną obsługę aplikacji. Struktura opiera się na podziale na widoki publiczne (np. ekran logowania) oraz widoki chronione (dashboard, generowanie fiszek, panel użytkownika, sesje powtórek). Wbudowane mechanizmy cache'owania Next.js oraz prosty system zarządzania stanem zapewniają wysoką wydajność i skalowalność.

## 2. Lista widoków

- **Ekran Autoryzacji**

  - Ścieżka: `/login` i `/register`
  - Główny cel: Autentykacja użytkownika za pomocą formularza logowania.
  - Kluczowe informacje: Formularz logowania/rejestracji, komunikaty o błędach, instrukcje walidacji.
  - Kluczowe komponenty: Inputy, przycisk logowania, inline alerts, system powiadomień (toast notifications).
  - UX, dostępność, bezpieczeństwo: Zgodność z WCAG AA, czytelna prezentacja informacji, zabezpieczenia przed atakami brute-force.

- **Dashboard**

  - Ścieżka: `/dashboard`
  - Główny cel: Przegląd aktywności użytkownika, statystyk i powiadomień.
  - Kluczowe informacje: Podsumowanie aktywności, statystyki generowania fiszek oraz powiadomienia.
  - Kluczowe komponenty: Karty statystyk, wykresy (opcjonalne), skróty do głównych funkcji.
  - UX, dostępność, bezpieczeństwo: Intuicyjny układ, szybki dostęp do kluczowych informacji, ochrona danych przed nieautoryzowanym dostępem.

- **Widok Generowania Fiszek**

  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie użytkownikowi wprowadzenia tekstu źródłowego, który AI przetworzy na propozycje fiszek.
  - Kluczowe informacje: Pole tekstowe z limitem od 1000 do 10000 znaków, instrukcje dotyczące poprawnego formatowania tekstu.
  - Kluczowe komponenty: Duże pole textarea, przycisk generowania, sekcja wyświetlania wyników, alerty inline.
  - UX, dostępność, bezpieczeństwo: Walidacja wejścia, responsywność, wsparcie dla urządzeń mobilnych, jasne komunikaty walidacyjne.

- **Widok Recenzji Fiszek i Bulk Zapis**

  - Ścieżka: `/flashcards`
  - Główny cel: Recenzja propozycji fiszek (akceptacja, edycja, odrzucenie) oraz zbiorczy zapis zatwierdzonych fiszek.
  - Kluczowe informacje: Lista fiszek z opcjami akcji, status recenzji każdej fiszki, możliwość bulk zapisu.
  - Kluczowe komponenty: Tabela/lista fiszek, modale potwierdzające akcje, przyciski akcji, inline alerts oraz toast notifications.
  - UX, dostępność, bezpieczeństwo: Interaktywność, wsparcie nawigacji klawiaturą, czytelna wizualizacja stanów (zaakceptowane, edytowane, odrzucone), ochrona przed przypadkowymi operacjami.

- **Panel Użytkownika**

  - Ścieżka: `/profile`
  - Główny cel: Zarządzanie kontem użytkownika (zmiana hasła, usunięcie konta).
  - Kluczowe informacje: Dane konta, opcje aktualizacji, potwierdzenia krytycznych operacji.
  - Kluczowe komponenty: Formularz aktualizacji hasła, przyciski akcji, modale potwierdzające operacje krytyczne.
  - UX, dostępność, bezpieczeństwo: Bezpieczne przetwarzanie danych, wyraźne komunikaty, ochrona przed nieautoryzowanymi zmianami.

- **Ekran Sesji Powtórek**
  - Ścieżka: `/review-sessions`
  - Główny cel: Umożliwienie użytkownikowi powtarzania zaakceptowanych fiszek zgodnie z algorytmem spaced repetition.
  - Kluczowe informacje: Lista fiszek do powtórek, postęp sesji, informacje o czasie trwania sesji.
  - Kluczowe komponenty: Karty fiszek, przyciski nawigacyjne w sesji, wskaźniki postępu, informacyjne alerty.
  - UX, dostępność, bezpieczeństwo: Intuicyjne sterowanie, duże przyciski, zgodność z wytycznymi dostępności (np. regulacja rozmiaru tekstu).

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na stronę `/login` i przeprowadza autentykację.
2. Po pomyślnym logowaniu następuje przekierowanie do `/dashboard`, gdzie prezentowane są statystyki i powiadomienia.
3. Użytkownik przechodzi do widoku `/generate`, by wprowadzić tekst źródłowy do generowania fiszek przez AI.
4. Po zakończeniu procesu generowania, użytkownik trafia na widok `/flashcards`, gdzie recenzuje i wybiera fiszki do zatwierdzenia.
5. Zaakceptowane fiszki są zbiorczo zapisywane za pomocą opcji "Zapisz wszystkie".
6. Użytkownik może przejść do panelu `/profile` w celu zarządzania kontem lub do `/review-sessions`, aby rozpocząć sesję powtórek.
7. Na każdym etapie interfejs wspiera użytkownika poprzez inline alerts oraz toast notifications, informujące o sukcesach i błędach.

## 4. Układ i struktura nawigacji

- Główne menu (header lub sidebar) dostępne w widokach chronionych umożliwia szybkie przełączanie między dashboardem, widokiem generowania fiszek, recenzji, profilem oraz sesjami powtórek.
- Responsywne menu z wykorzystaniem komponentów shadcn/ui i Tailwind CSS dostosowuje się do urządzeń mobilnych i desktopowych.
- Breadcrumbs pomagają użytkownikowi śledzić aktualną lokalizację w aplikacji.
- W przypadku wystąpienia błędów, system prezentuje inline alerts oraz toast notifications bez zakłócania głównego przepływu użytkownika.

## 5. Kluczowe komponenty

- **Formularze**: Formularz logowania, formularz generowania fiszek, formularze edycji i recenzji fiszek.
- **Karty/Listy**: Komponenty do wyświetlania listy fiszek, karty statystyk, karty sesji powtórek.
- **Modale**: Potwierdzanie operacji usunięcia lub edycji fiszek oraz usunięcia konta użytkownika.
- **Nawigacja**: Komponenty menu, breadcrumbs i linki nawigacyjne umożliwiające płynne przechodzenie między widokami.
- **Alerty i Powiadomienia**: Inline alerts dla krytycznych błędów oraz toast notifications dla potwierdzeń działań i informacji systemowych.
- **Komponenty Dostępności**: Role ARIA, odpowiednie etykiety, wsparcie nawigacji klawiaturą, zapewniające zgodność z WCAG AA.
