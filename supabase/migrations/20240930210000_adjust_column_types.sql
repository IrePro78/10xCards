-- -----------------------------------------------------------------------------
-- Nazwa migracji: Dostosowanie typów kolumn czasowych
-- Data utworzenia: 2024-09-30
-- Autor: Claude
-- 
-- Opis:
-- Ta migracja dostosowuje typy kolumn czasowych do formatu timestamptz
-- zgodnie z diagramem i usuwa wyzwalacz z tabeli flashcards, który nie
-- jest już potrzebny po usunięciu kolumny status.
-- -----------------------------------------------------------------------------

-- Zmiana typu kolumn czasowych w tabeli flashcards na timestamptz
alter table flashcards
alter column created_at type timestamptz using created_at::timestamptz,
alter column updated_at type timestamptz using updated_at::timestamptz;

-- Zmiana typu kolumn czasowych w tabeli generation_error_logs na timestamptz
alter table generation_error_logs
alter column created_at type timestamptz using created_at::timestamptz;

-- Sprawdzenie czy kolumna source w tabeli flashcards jest typu varchar
-- Jeśli nie, dostosuj typ do diagramu
do $$
declare
    column_type text;
begin
    select data_type into column_type
    from information_schema.columns
    where table_name = 'flashcards' and column_name = 'source';
    
    if column_type != 'character varying' then
        execute 'alter table flashcards alter column source type varchar using source::varchar';
    end if;
end $$; 