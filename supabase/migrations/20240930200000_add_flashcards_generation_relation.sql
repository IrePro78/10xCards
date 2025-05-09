-- -----------------------------------------------------------------------------
-- Nazwa migracji: Dodanie relacji między fiszkami a generacjami
-- Data utworzenia: 2024-09-30
-- Autor: Claude
-- 
-- Opis:
-- Ta migracja dodaje kolumnę generation_id do tabeli flashcards,
-- tworząc relację między fiszkami a ich źródłową generacją.
-- Pozwala to na śledzenie, z której generacji pochodzi dana fiszka.
-- -----------------------------------------------------------------------------

-- dodanie kolumny generation_id do tabeli flashcards
alter table flashcards
add column generation_id uuid references generations(id) on delete set null;

-- komentarz do nowej kolumny
comment on column flashcards.generation_id is 'Powiązanie z generacją, z której pochodzi fiszka (null dla fiszek utworzonych ręcznie)';

-- indeks dla nowej kolumny dla efektywnego filtrowania fiszek według generacji
create index if not exists flashcards_generation_id_idx on flashcards(generation_id);

-- aktualizacja istniejących polityk RLS aby uwzględniały nową kolumnę
-- polityki nie wymagają zmian, ponieważ dostęp do fiszek jest już kontrolowany przez user_id 