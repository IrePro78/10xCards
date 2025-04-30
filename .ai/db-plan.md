# Schemat bazy danych dla 10xCards

## 1. Tabele, kolumny, typy danych i ograniczenia

### Tabela `users`

This table is managed by Supabase Auth.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalny identyfikator użytkownika |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Adres email użytkownika |
| password_hash | VARCHAR(255) | NOT NULL | Zahaszowane hasło użytkownika |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data utworzenia konta |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data ostatniej aktualizacji konta |
| confirmed_at | TIMESTAMP | NULL | Data potwierdzenia konta (null oznacza brak potwierdzenia) |

### Tabela `flashcards`
| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalny identyfikator fiszki |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Powiązanie z użytkownikiem |
| front | VARCHAR(200) | NOT NULL, CHECK (length(front) <= 200) | Przód fiszki (pytanie) |
| back | VARCHAR(500) | NOT NULL, CHECK (length(back) <= 500) | Tył fiszki (odpowiedź) |
| status | VARCHAR(20) | NOT NULL, CHECK (status IN ('pending', 'accepted', 'rejected')) | Status fiszki |
| source | VARCHAR(10) | NOT NULL, CHECK (source IN ('ai', 'user')) | Źródło utworzenia fiszki |
| next_review_at | TIMESTAMP | NULL | Data następnej powtórki |
| review_count | INTEGER | NOT NULL, DEFAULT 0 | Liczba wykonanych powtórek |
| easiness_factor | NUMERIC | NOT NULL, DEFAULT 2.5, CHECK (easiness_factor >= 1.0) | Współczynnik łatwości fiszki |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data utworzenia fiszki |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data ostatniej aktualizacji fiszki |

### Tabela `generations`
| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalny identyfikator generacji |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Powiązanie z użytkownikiem |
| model | VARCHAR(50) | NOT NULL | Nazwa modelu AI użytego do generacji |
| generated_count | INTEGER | NOT NULL, DEFAULT 0 | Liczba wygenerowanych fiszek |
| accepted_unedited_count | INTEGER | NOT NULL, DEFAULT 0 | Liczba zaakceptowanych fiszek bez edycji |
| accepted_edited_count | INTEGER | NOT NULL, DEFAULT 0 | Liczba zaakceptowanych fiszek po edycji |
| source_text_hash | VARCHAR(64) | NOT NULL | Hash tekstu źródłowego |
| source_text_length | INTEGER | NOT NULL | Długość tekstu źródłowego |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data generacji |

### Tabela `generation_error_logs`
| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalny identyfikator błędu |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Powiązanie z użytkownikiem |
| model | VARCHAR(50) | NOT NULL | Nazwa modelu AI |
| source_text_hash | VARCHAR(64) | NOT NULL | Hash tekstu źródłowego |
| source_text_length | INTEGER | NOT NULL | Długość tekstu źródłowego |
| error_code | VARCHAR(50) | NULL | Kod błędu |
| error_message | TEXT | NOT NULL | Treść komunikatu błędu |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Data wystąpienia błędu |

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

## 3. Indeksy

### Tabela `users`
- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `email` (już zdefiniowany przez ograniczenie UNIQUE)

### Tabela `flashcards`
- Automatyczny indeks na kluczu głównym `id`
- Indeks na kolumnie `user_id` dla szybkiego wyszukiwania fiszek użytkownika
- Indeks na kolumnie `created_at` dla optymalnej paginacji
- Indeks na kolumnie `next_review_at` dla efektywnego wyszukiwania fiszek do powtórki
- Indeks na kolumnach `user_id, status` dla filtrowania fiszek według statusu

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
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT USING (user_id = auth.uid());

-- Polityka INSERT - użytkownik może dodawać fiszki tylko do własnego konta
CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Polityka UPDATE - użytkownik może aktualizować tylko swoje fiszki
CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE USING (user_id = auth.uid());

-- Polityka DELETE - użytkownik może usuwać tylko swoje fiszki
CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE USING (user_id = auth.uid());
```

### Tabela `generations`
```sql
-- Polityka SELECT - użytkownik może przeglądać tylko swoje generacje
CREATE POLICY generations_select_policy ON generations
    FOR SELECT USING (user_id = auth.uid());

-- Polityka INSERT - użytkownik może dodawać generacje tylko do własnego konta
CREATE POLICY generations_insert_policy ON generations
    FOR INSERT WITH CHECK (user_id = auth.uid());
```

### Tabela `generation_error_logs`
```sql
-- Polityka SELECT - użytkownik może przeglądać tylko swoje logi błędów
CREATE POLICY generation_error_logs_select_policy ON generation_error_logs
    FOR SELECT USING (user_id = auth.uid());

-- Polityka INSERT - użytkownik może dodawać logi błędów tylko do własnego konta
CREATE POLICY generation_error_logs_insert_policy ON generation_error_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());
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

## 6. Dodatkowe uwagi i wyjaśnienia

1. **Typy statusów fiszek:**
   - `pending` - fiszki wygenerowane przez AI, czekające na decyzję
   - `accepted` - fiszki zaakceptowane przez użytkownika
   - `rejected` - fiszki odrzucone przez użytkownika

2. **Powtórki:**
   - Pole `next_review_at` określa kiedy fiszka powinna zostać ponownie pokazana
   - Pola `review_count` i `easiness_factor` są używane przez algorytm powtórek do obliczania `next_review_at`

3. **Bezpieczeństwo:**
   - Użycie RLS zapewnia, że użytkownik ma dostęp tylko do swoich danych
   - Wszystkie wrażliwe operacje są chronione przez RLS
   - Hasła są przechowywane jako hashe, nigdy jako plain text

4. **Śledzenie generacji AI:**
   - Tabela `generations` przechowuje statystyki dotyczące generacji fiszek
   - Tabela `generation_error_logs` rejestruje błędy podczas generacji

5. **Limity długości**:
   - Pola `front` i `back` mają ograniczenia zgodne z wymaganiami biznesowymi (odpowiednio 200 i 500 znaków)
   - Ograniczenia są wymuszane zarówno na poziomie bazy danych (CHECK), jak i w aplikacji

6. **Audyt**:
   - Wszystkie tabele zawierają pola `created_at` i `updated_at` dla śledzenia zmian
   - Triggery automatycznie aktualizują pole `updated_at` przy każdej modyfikacji rekordu 