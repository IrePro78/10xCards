# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Opis: 10xCards to aplikacja webowa umożliwiająca efektywne tworzenie i zarządzanie fiszkami edukacyjnymi. Główna wartość produktu skupia się na generowaniu fiszek przy użyciu AI, co znacząco skraca czas potrzebny na manualne tworzenie fiszek. Użytkownicy mają możliwość tworzenia fiszek ręcznie, a także przeglądania, edytowania i usuwania już zapisanych fiszek. System zawiera również prosty mechanizm zarządzania kontami, ograniczony do zmiany hasła oraz usuwania konta. Zaakceptowane fiszki są integrowane z gotowym algorytmem powtórek opartym na bibliotece open source.

## 2. Problem użytkownika

Problem: Użytkownicy spędzają zbyt dużo czasu na ręcznym tworzeniu fiszek, co ogranicza efektywność nauki metodą spaced repetition. Dodatkowo, brak wiedzy na temat efektywnego tworzenia fiszek utrudnia proces nauki.

## 3. Wymagania funkcjonalne

1. Generowanie fiszek przez AI:
   - Użytkownik wkleja tekst o długości od 1000 do 10000 znaków, na podstawie którego AI generuje kandydatów na fiszki.
   - Fiszki są przedstawiane jako kandydaci, które użytkownik musi recenzować (zaakceptować, edytować lub odrzucić) przed zapisaniem do bazy danych.
2. Manualne tworzenie fiszek:
   - Użytkownik korzysta z prostego formularza dostępnego w modal, umożliwiającego ręczne wprowadzenie danych fiszki.
   - Formularz zawiera pola "przód" (maksymalnie 200 znaków) oraz "tył" (maksymalnie 500 znaków).
3. Zarządzanie fiszkami:
   - Lista zapisanych fiszek wyposażona jest w funkcję wyszukiwania (inicjowaną przyciskiem) oraz paginację.
   - Użytkownik może edytować fiszki za pomocą modal oraz usuwać je z systemu przy potwierdzeniu operacji.
4. System kont użytkowników:
   - Użytkownik ma możliwość zmiany hasła oraz usunięcia swojego konta.
5. Integracja z algorytmem powtórek:
   - Zaakceptowane fiszki są automatycznie integrowane z gotowym algorytmem powtórek, wykorzystując bibliotekę open source, bez dodatkowych konfiguracji.
6. Walidacja danych:
   - Walidacja odbywa się na poziomie frontendu, backendu oraz w bazie danych.
   - Błędy walidacji są wyświetlane inline przy polach formularza, a potwierdzenie zapisu pojawia się po zatwierdzeniu operacji.

## 4. Granice produktu

Produkt nie obejmuje:

- Własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Importu plików w różnych formatach (PDF, DOCX itp.).
- Współdzielenia zestawów fiszek między użytkownikami.
- Integracji z innymi platformami edukacyjnymi.
- Aplikacji mobilnych – obecnie dostępna jest tylko wersja webowa.
  Dodatkowo:
- Nie określono szczegółowego mechanizmu czasowego wyświetlania komunikatów potwierdzających zapis fiszek.
- Opcja cofania zmian w edycji nie jest przewidziana w MVP.

## 5. Historyjki użytkowników

US-001
Tytuł: Generowanie fiszek przez AI
Opis: Użytkownik wkleja tekst (od 1000 do 10000 znaków) do systemu, na podstawie którego AI generuje kandydatów na fiszki.
Kryteria akceptacji:

- Użytkownik może wprowadzić tekst mieszczący się w wymaganym zakresie znaków.
- AI generuje zestaw fiszek, które są prezentowane jako kandydaci do dalszej recenzji.
- Użytkownik ma możliwość przejścia do etapu recenzji fiszek.

US-002
Tytuł: Recenzja fiszek wygenerowanych przez AI
Opis: Użytkownik przegląda wygenerowane fiszki, może je zaakceptować, edytować lub odrzucić przed zapisaniem do bazy.
Kryteria akceptacji:

- Fiszki są prezentowane z opcjami akceptacji, edycji i odrzucenia.
- Akceptacja fiszki powoduje jej zapis do bazy danych.

US-003
Tytuł: Manualne tworzenie fiszek
Opis: Użytkownik tworzy fiszki ręcznie za pomocą formularza w modal, wprowadzając dane do pól "przód" i "tył".
Kryteria akceptacji:

- Formularz wymusza limit 200 znaków dla pola "przód" i 500 znaków dla pola "tył".
- Walidacja danych odbywa się w czasie rzeczywistym z wyświetlaniem inline błędów.

US-004
Tytuł: Edytowanie i usuwanie fiszek
Opis: Użytkownik przegląda zapisane fiszki w liście z funkcją wyszukiwania i paginacją, co umożliwia edycję i usuwanie fiszek.
Kryteria akceptacji:

- Lista fiszek umożliwia wyszukiwanie i paginację.
- Edycja fiszek odbywa się za pomocą modal, a zmiany są zatwierdzane.
- Usuwanie fiszek wymaga potwierdzenia operacji.

US-005
Tytuł: Zarządzanie kontem użytkownika
Opis: Użytkownik ma możliwość zmiany hasła oraz usunięcia swojego konta.
Kryteria akceptacji:

- Interfejs umożliwia użytkownikowi łatwą zmianę hasła.
- Użytkownik może usunąć konto, po czym system potwierdza operację.

US-006
Tytuł: Integracja z algorytmem powtórek
Opis: Zaakceptowane fiszki są integrowane z algorytmem powtórek opartym na gotowej bibliotece open source.
Kryteria akceptacji:

- Zaakceptowane fiszki są automatycznie dostępne dla algorytmu powtórek.
- Integracja odbywa się bez konieczności dodatkowych konfiguracji.

US-007
Tytuł: Walidacja danych podczas zapisu fiszek
Opis: System waliduje dane wprowadzone przez użytkownika na poziomie frontendu, backendu oraz w bazie danych.
Kryteria akceptacji:

- Błędy walidacji wyświetlane są inline przy odpowiednich polach formularza.
- Potwierdzenie zapisu pojawia się po zatwierdzeniu operacji.

US-008
Tytuł: Bezpieczny dostęp / Uwierzytelnianie
Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
Kryteria akceptacji:

- Logowanie i rejestracja odbywają się na dedykowanych stronach.
- Logowanie wymaga podania adresu email i hasła.
- Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
- Użytkownik MOŻE przeglądać fiszki bez logowania się do systemu.
- Użytkownik NIE MOŻE tworzyć, edytować i usuwać fiszek bez zalogowania się do systemu.
- Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu w głównym @layout.tsx lub @mainNav.tsx
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @layout.tsx lub @mainNav.tsx
- Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub) - używamy tylko email i hasło.
- Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu

- 75% fiszek generowanych przez AI musi zostać zaakceptowanych przez użytkownika.
- 75% operacji tworzenia fiszek powinno odbywać się przy użyciu funkcji generowania AI.
- System wyświetla inline komunikaty o błędach oraz potwierdzenia zapisu po operacjach.
