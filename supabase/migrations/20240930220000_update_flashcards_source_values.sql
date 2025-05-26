-- -----------------------------------------------------------------------------
-- Nazwa migracji: Aktualizacja dozwolonych wartości dla kolumny source w tabeli flashcards
-- Data utworzenia: 2024-09-30
-- Autor: Claude
-- 
-- Opis:
-- Ta migracja modyfikuje ograniczenie CHECK na kolumnie source w tabeli flashcards,
-- dodając nową dozwoloną wartość 'ai-edited' oraz zmieniając 'user' na 'manual'.
-- -----------------------------------------------------------------------------

-- Usuwamy stare ograniczenie
alter table flashcards drop constraint if exists flashcards_source_check;

-- Dodajemy nowe ograniczenie z zaktualizowanymi wartościami
alter table flashcards add constraint flashcards_source_check 
    check (source in ('ai', 'ai-edited', 'manual'));

-- Aktualizujemy istniejące rekordy, zmieniając 'user' na 'manual'
update flashcards set source = 'manual' where source = 'user'; 