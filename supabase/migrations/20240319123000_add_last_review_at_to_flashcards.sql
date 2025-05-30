-- Dodanie kolumny last_review_at do tabeli flashcards
-- Kolumna będzie przechowywać datę ostatniej powtórki fiszki
-- Domyślnie ustawiona na NULL, co oznacza że fiszka nie była jeszcze powtarzana

alter table "public"."flashcards" 
add column "last_review_at" timestamp with time zone default null;

-- Aktualizacja komentarza tabeli
comment on table "public"."flashcards" is 'Tabela przechowująca fiszki użytkowników z informacją o dacie ostatniej powtórki';

-- Aktualizacja polityki bezpieczeństwa dla nowej kolumny
alter table "public"."flashcards" enable row level security; 