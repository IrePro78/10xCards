-- -----------------------------------------------------------------------------
-- Nazwa migracji: Dostosowanie schematu bazy danych do diagramu
-- Data utworzenia: 2024-09-30
-- Autor: Claude
-- 
-- Opis:
-- Ta migracja dostosowuje schemat bazy danych do diagramu,
-- usuwając niepotrzebne kolumny i dodając brakujące.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Tabela: flashcards - usunięcie niepotrzebnych kolumn
-- -----------------------------------------------------------------------------

-- usunięcie kolumn, których nie ma na diagramie
alter table flashcards
drop column if exists status,
drop column if exists next_review_at,
drop column if exists review_count,
drop column if exists easiness_factor;

-- -----------------------------------------------------------------------------
-- Tabela: generations - dodanie brakujących kolumn
-- -----------------------------------------------------------------------------

-- dodanie kolumny generation_duration
alter table generations
add column if not exists generation_duration int4;

-- dodanie kolumny updated_at jeśli nie istnieje
alter table generations
add column if not exists updated_at timestamp with time zone default now();

-- komentarz do nowych kolumn
comment on column generations.generation_duration is 'Czas trwania generacji w milisekundach';
comment on column generations.updated_at is 'Data ostatniej aktualizacji rekordu generacji';

-- utworzenie funkcji do aktualizacji updated_at dla tabeli generations
create or replace function update_generations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- wyzwalacz do aktualizacji updated_at dla tabeli generations
create trigger update_generations_updated_at_trigger
before update on generations
for each row
execute function update_generations_updated_at(); 