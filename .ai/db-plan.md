# Schemat bazy danych PostgreSQL

## 1. Tabele i kolumny

### 1.1. tabela: users
- id: uuid, primary key, default gen_random_uuid() (wymaga rozszerzenia pgcrypto lub uuid-ossp)
- email: varchar, not null, unique
- hash_hasła: text, not null
- data_utworzenia: timestamptz, not null, default now()
- data_modyfikacji: timestamptz, not null, default now()
- confirmed_at: timestamptz, nullable

### 1.2. tabela: flashcards
- id: uuid, primary key, default gen_random_uuid()
- user_id: uuid, not null, references users(id) on delete cascade
- front: varchar(200), not null, check (char_length(front) <= 200)
- back: varchar(500), not null, check (char_length(back) <= 500)
- status: varchar, not null, check (status in ('do zatwierdzenia','zaakceptowana','odrzucona'))
- source: varchar, not null, check (source in ('ai','user'))
- next_review_at: timestamptz, nullable
- review_count: integer, not null, default 0
- easiness_factor: numeric, not null, default 2.5, check (easiness_factor >= 1)
- data_utworzenia: timestamptz, not null, default now()

### 1.3. tabela: generations
- id: uuid, primary key, default gen_random_uuid()
- user_id: uuid, not null, references users(id) on delete cascade
- model: varchar, not null
- generated_count: integer, not null
- accepted_unedited_count: integer, not null
- accepted_edited_count: integer, not null
- source_text_hash: varchar, not null
- source_text_length: integer, not null
- data_utworzenia: timestamptz, not null, default now()

### 1.4. tabela: generation_error_logs
- id: uuid, primary key, default gen_random_uuid()
- user_id: uuid, not null, references users(id) on delete cascade
- model: varchar, not null
- source_text_hash: varchar, not null
- source_text_length: integer, not null
- error_code: varchar, not null
- error_message: text, not null
- data_utworzenia: timestamptz, not null, default now()

## 2. Relacje między tabelami
- tabela "users" ma relację 1-do-wielu z tabelami:
  - flashcards (klucz: user_id)
  - generations (klucz: user_id)
  - generation_error_logs (klucz: user_id)

## 3. Indeksy
- tabela flashcards:
  - indeks na kolumnie user_id
  - indeks na kolumnie data_utworzenia
- tabele generations oraz generation_error_logs:
  - indeksy na kolumnie user_id (dla optymalizacji zapytań)

## 4. Polityki bezpieczeństwa (RLS)
- w tabeli "flashcards" włączone są polityki RLS:
  - POLITYKA SELECT: umożliwia odczyt wierszy, gdzie flashcards.user_id = current_setting('app.current_user')::uuid
  - POLITYKA INSERT: umożliwia dodawanie wierszy, jeśli flashcards.user_id = current_setting('app.current_user')::uuid
  - POLITYKA UPDATE: umożliwia aktualizację tylko dla właściciela rekordu
  - POLITYKA DELETE: umożliwia usuwanie tylko przez właściciela rekordu

*(Podobne polityki RLS należy zaimplementować w tabelach "generations" i "generation_error_logs" w celu zapewnienia bezpieczeństwa dostępu.)*

## 5. Dodatkowe uwagi
- mechanizmy audytu: dla tabeli "flashcards" warto wdrożyć triggery monitorujące krytyczne operacje (INSERT, UPDATE, DELETE)
- synchronizacja typów danych: definicje kolumn są zgodne z typami wykorzystywanymi w aplikacji TypeScript i przez Supabase
- upewnij się, że wymagane rozszerzenia PostgreSQL (np. pgcrypto lub uuid-ossp) są zainstalowane do generowania wartości UUID 