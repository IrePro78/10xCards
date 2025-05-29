# Schemat bazy danych dla 10xCards

## 1. Tabele, kolumny, typy danych i ograniczenia

### Tabela `users`

This table is managed by Supabase Auth.

| Kolumna       | Typ          | Ograniczenia                            | Opis                                                       |
| ------------- | ------------ | --------------------------------------- | ---------------------------------------------------------- |
| id            | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalny identyfikator użytkownika                         |
| email         | VARCHAR(255) | UNIQUE, NOT NULL                        | Adres email użytkownika                                    |
| password_hash | VARCHAR(255) | NOT NULL                                | Zahaszowane hasło użytkownika                              |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                 | Data utworzenia konta                                      |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                 | Data ostatniej aktualizacji konta                          |
| confirmed_at  | TIMESTAMPTZ  | NULL                                    | Data potwierdzenia konta (null oznacza brak potwierdzenia) |

### Tabela `flashcards`

| Kolumna       | Typ          | Ograniczenia                                        | Opis                                             |
| ------------- | ------------ | --------------------------------------------------- | ------------------------------------------------ |
| id            | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4()             | Unikalny identyfikator fiszki                    |
| user_id       | UUID         | NOT NULL, REFERENCES users(id) ON DELETE CASCADE    | Powiązanie z użytkownikiem                       |
| generation_id | UUID         | NULL, REFERENCES generations(id) ON DELETE SET NULL | Powiązanie z generacją, z której pochodzi fiszka |
| front         | VARCHAR(200) | NOT NULL, CHECK (length(front) <= 200)              | Przód fiszki (pytanie)                           |
| back          | VARCHAR(500) | NOT NULL, CHECK (length(back) <= 500)               | Tył fiszki (odpowiedź)                           |
| source        | VARCHAR(10)  | NOT NULL, CHECK (source IN ('ai', 'user'))          | Źródło utworzenia fiszki                         |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                             | Data utworzenia fiszki                           |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                             | Data ostatniej aktualizacji fiszki               |

### Tabela `generations`

| Kolumna                 | Typ         | Ograniczenia                                     | Opis                                     |
| ----------------------- | ----------- | ------------------------------------------------ | ---------------------------------------- |
| id                      | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()          | Unikalny identyfikator generacji         |
| user_id                 | UUID        | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Powiązanie z użytkownikiem               |
| model                   | VARCHAR(50) | NOT NULL                                         | Nazwa modelu AI użytego do generacji     |
| generated_count         | INTEGER     | NOT NULL, DEFAULT 0                              | Liczba wygenerowanych fiszek             |
| accepted_unedited_count | INTEGER     | NOT NULL, DEFAULT 0                              | Liczba zaakceptowanych fiszek bez edycji |
| accepted_edited_count   | INTEGER     | NOT NULL, DEFAULT 0                              | Liczba zaakceptowanych fiszek po edycji  |
| source_text_hash        | VARCHAR(64) | NOT NULL                                         | Hash tekstu źródłowego                   |
| source_text_length      | INTEGER     | NOT NULL                                         | Długość tekstu źródłowego                |
| generation_duration     | INTEGER     | NULL                                             | Czas trwania generacji w milisekundach   |
| created_at              | TIMESTAMPTZ | NOT NULL, DEFAULT now()                          | Data generacji                           |
| updated_at              | TIMESTAMPTZ | NOT NULL, DEFAULT now()                          | Data ostatniej aktualizacji generacji    |

### Tabela `generation_error_logs`

| Kolumna            | Typ         | Ograniczenia                                     | Opis                         |
| ------------------ | ----------- | ------------------------------------------------ | ---------------------------- |
| id                 | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()          | Unikalny identyfikator błędu |
| user_id            | UUID        | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Powiązanie z użytkownikiem   |
| model              | VARCHAR(50) | NOT NULL                                         | Nazwa modelu AI              |
| source_text_hash   | VARCHAR(64) | NOT NULL                                         | Hash tekstu źródłowego       |
| source_text_length | INTEGER     | NOT NULL                                         | Długość tekstu źródłowego    |
| error_code         | VARCHAR(50) | NULL                                             | Kod błędu                    |
| error_message      | TEXT        | NOT NULL                                         | Treść komunikatu błędu       |
| created_at         | TIMESTAMPTZ | NOT NULL, DEFAULT now()                          | Data wystąpienia błędu       |

## 2. Relacje między tabelami

1. **Użytkownik do Fiszek (1:N)**

   - Jeden użytkownik może posiadać wiele fiszek
   - Fiszki należą tylko do jednego użytkownika
   - Klucz obcy: `flashcards.user_id` referuje do `users.id` z opcją `ON DELETE CASCADE`

2. **Użytkownik do Generacji (1:N)**

   - Jeden użytkownik może mieć wiele generacji
   - Generacja należy tylko do jednego użytkownika
   - Klucz obcy: `generations.user_id` referuje do `users.id` z opcją `ON DELETE CASCADE`

3. **Użytkownik do Logów błędów generacji (1:N)**

   - Jeden użytkownik może mieć wiele logów błędów
   - Log błędu należy tylko do jednego użytkownika
   - Klucz obcy: `generation_error_logs.user_id` referuje do `users.id` z opcją `ON DELETE CASCADE`

4. **Generacja do Fiszek (1:N)**
   - Jedna generacja może wytworzyć wiele fiszek
   - Fiszka może być powiązana tylko z jedną generacją (lub z żadną, jeśli została utworzona ręcznie)
   - Klucz obcy: `flashcards.generation_id` referuje do `generations.id` z opcją `ON DELETE SET NULL`

## 3. Indeksy

### Tabela `users`

- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `email` (już zdefiniowany przez ograniczenie UNIQUE)

### Tabela `flashcards`

- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `user_id` dla szybkiego wyszukiwania fiszek użytkownika
- Indeks na kolumnie `generation_id` dla szybkiego wyszukiwania fiszek z danej generacji
- Indeks na kolumnie `created_at` dla optymalnej paginacji

### Tabela `generations`

- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `user_id` dla szybkiego wyszukiwania generacji użytkownika
- Indeks na kolumnie `created_at` dla paginacji

### Tabela `generation_error_logs`

- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `user_id` dla szybkiego wyszukiwania logów użytkownika

## 4. Zasady PostgreSQL Row Level Security (RLS)

### Tabela `users`

```sql
-- Pozwala użytkownikowi na dostęp tylko do własnego rekordu
CREATE POLICY users_policy ON users
    USING (id = auth.uid());
```

### Tabela `flashcards`

```sql
-- Polityka SELECT - użytkownik może przeglądać tylko swoje fiszki
CREATE POLICY flashcards_select_policy_for_authenticated ON flashcards
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka SELECT dla anonimowych użytkowników - brak dostępu
CREATE POLICY flashcards_select_policy_for_anon ON flashcards
    FOR SELECT
    TO anon
    USING (false);

-- Polityka INSERT - użytkownik może dodawać fiszki tylko do własnego konta
CREATE POLICY flashcards_insert_policy_for_authenticated ON flashcards
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Polityka INSERT dla anonimowych użytkowników - brak dostępu
CREATE POLICY flashcards_insert_policy_for_anon ON flashcards
    FOR INSERT
    TO anon
    WITH CHECK (false);

-- Polityka UPDATE - użytkownik może aktualizować tylko swoje fiszki
CREATE POLICY flashcards_update_policy_for_authenticated ON flashcards
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka UPDATE dla anonimowych użytkowników - brak dostępu
CREATE POLICY flashcards_update_policy_for_anon ON flashcards
    FOR UPDATE
    TO anon
    USING (false);

-- Polityka DELETE - użytkownik może usuwać tylko swoje fiszki
CREATE POLICY flashcards_delete_policy_for_authenticated ON flashcards
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka DELETE dla anonimowych użytkowników - brak dostępu
CREATE POLICY flashcards_delete_policy_for_anon ON flashcards
    FOR DELETE
    TO anon
    USING (false);
```

### Tabela `generations`

```sql
-- Polityka SELECT - użytkownik może przeglądać tylko swoje generacje
CREATE POLICY generations_select_policy_for_authenticated ON generations
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka SELECT dla anonimowych użytkowników - brak dostępu
CREATE POLICY generations_select_policy_for_anon ON generations
    FOR SELECT
    TO anon
    USING (false);

-- Polityka INSERT - użytkownik może dodawać generacje tylko do własnego konta
CREATE POLICY generations_insert_policy_for_authenticated ON generations
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Polityka INSERT dla anonimowych użytkowników - brak dostępu
CREATE POLICY generations_insert_policy_for_anon ON generations
    FOR INSERT
    TO anon
    WITH CHECK (false);

-- Polityka UPDATE - użytkownik może aktualizować tylko swoje generacje
CREATE POLICY generations_update_policy_for_authenticated ON generations
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka UPDATE dla anonimowych użytkowników - brak dostępu
CREATE POLICY generations_update_policy_for_anon ON generations
    FOR UPDATE
    TO anon
    USING (false);

-- Polityka DELETE - użytkownik może usuwać tylko swoje generacje
CREATE POLICY generations_delete_policy_for_authenticated ON generations
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka DELETE dla anonimowych użytkowników - brak dostępu
CREATE POLICY generations_delete_policy_for_anon ON generations
    FOR DELETE
    TO anon
    USING (false);
```

### Tabela `generation_error_logs`

```sql
-- Polityka SELECT - użytkownik może przeglądać tylko swoje logi błędów
CREATE POLICY generation_error_logs_select_policy_for_authenticated ON generation_error_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka SELECT dla anonimowych użytkowników - brak dostępu
CREATE POLICY generation_error_logs_select_policy_for_anon ON generation_error_logs
    FOR SELECT
    TO anon
    USING (false);

-- Polityka INSERT - użytkownik może dodawać logi błędów tylko do własnego konta
CREATE POLICY generation_error_logs_insert_policy_for_authenticated ON generation_error_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Polityka INSERT dla anonimowych użytkowników - brak dostępu
CREATE POLICY generation_error_logs_insert_policy_for_anon ON generation_error_logs
    FOR INSERT
    TO anon
    WITH CHECK (false);

-- Polityka UPDATE - użytkownik może aktualizować tylko swoje logi błędów
CREATE POLICY generation_error_logs_update_policy_for_authenticated ON generation_error_logs
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka UPDATE dla anonimowych użytkowników - brak dostępu
CREATE POLICY generation_error_logs_update_policy_for_anon ON generation_error_logs
    FOR UPDATE
    TO anon
    USING (false);

-- Polityka DELETE - użytkownik może usuwać tylko swoje logi błędów
CREATE POLICY generation_error_logs_delete_policy_for_authenticated ON generation_error_logs
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Polityka DELETE dla anonimowych użytkowników - brak dostępu
CREATE POLICY generation_error_logs_delete_policy_for_anon ON generation_error_logs
    FOR DELETE
    TO anon
    USING (false);
```

## 5. Wyzwalacze (Triggers)

### Trigger aktualizacji pola `updated_at` dla tabeli `users`

```sql
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();
```

### Trigger aktualizacji pola `updated_at` dla tabeli `flashcards`

```sql
CREATE OR REPLACE FUNCTION update_flashcards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcards_updated_at_trigger
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_flashcards_updated_at();
```

### Trigger aktualizacji pola `updated_at` dla tabeli `generations`

```sql
CREATE OR REPLACE FUNCTION update_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generations_updated_at_trigger
BEFORE UPDATE ON generations
FOR EACH ROW
EXECUTE FUNCTION update_generations_updated_at();
```

## 6. Dodatkowe uwagi i wyjaśnienia

1. **Źródła fiszek:**

   - `ai` - fiszki wygenerowane przez AI
   - `ai-edited` - fiszki wygenerowane przez AI, które zostały edytowane przez użytkownika
   - `user` - fiszki utworzone ręcznie przez użytkownika

2. **Relacja między fiszkami a generacjami:**

   - Fiszki mogą być powiązane z generacją poprzez `generation_id`
   - Fiszki utworzone ręcznie mają `generation_id` ustawione na NULL
   - W przypadku usunięcia generacji, powiązane fiszki pozostają, ale ich `generation_id` jest ustawiane na NULL

3. **Bezpieczeństwo:**

   - Użycie RLS zapewnia, że użytkownik ma dostęp tylko do swoich danych
   - Wszystkie wrażliwe operacje są chronione przez RLS
   - Hasła są przechowywane jako hashe, nigdy jako plain text
   - Polityki RLS są definiowane oddzielnie dla użytkowników `authenticated` i `anon`

4. **Śledzenie generacji AI:**

   - Tabela `generations` przechowuje statystyki dotyczące generacji fiszek
   - Kolumna `generation_duration` rejestruje czas trwania generacji w milisekundach
   - Tabela `generation_error_logs` rejestruje błędy podczas generacji

5. **Limity długości**:

   - Pola `front` i `back` mają ograniczenia zgodne z wymaganiami biznesowymi (odpowiednio 200 i 500 znaków)
   - Ograniczenia są wymuszane zarówno na poziomie bazy danych (CHECK), jak i w aplikacji

6. **Audyt**:
   - Wszystkie tabele zawierają pola `created_at` dla rejestracji czasu utworzenia
   - Tabele `users`, `flashcards` i `generations` zawierają pola `updated_at` dla śledzenia zmian
   - Triggery automatycznie aktualizują pole `updated_at` przy każdej modyfikacji rekordu
