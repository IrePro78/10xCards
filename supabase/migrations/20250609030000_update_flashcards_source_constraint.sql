-- Aktualizacja ograniczenia na kolumnie source w tabeli flashcards
alter table public.flashcards 
drop constraint flashcards_source_check,
add constraint flashcards_source_check 
check (source in ('ai', 'ai-edited', 'manual')); 