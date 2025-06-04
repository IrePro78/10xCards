-- migrate:up

-- Enable RLS on all tables
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- Policies for flashcards
create policy "Użytkownicy mogą czytać swoje fiszki"
    on flashcards for select
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą dodawać fiszki"
    on flashcards for insert
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować swoje fiszki"
    on flashcards for update
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać swoje fiszki"
    on flashcards for delete
    using (auth.uid() = user_id);

-- Policies for generations
create policy "Użytkownicy mogą czytać swoje generacje"
    on generations for select
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą dodawać generacje"
    on generations for insert
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować swoje generacje"
    on generations for update
    using (auth.uid() = user_id);

-- Policies for generation_error_logs
create policy "Użytkownicy mogą czytać swoje logi błędów"
    on generation_error_logs for select
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą dodawać logi błędów"
    on generation_error_logs for insert
    with check (auth.uid() = user_id);

-- migrate:down
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security;

drop policy if exists "Użytkownicy mogą czytać swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą dodawać fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą aktualizować swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą usuwać swoje fiszki" on flashcards;

drop policy if exists "Użytkownicy mogą czytać swoje generacje" on generations;
drop policy if exists "Użytkownicy mogą dodawać generacje" on generations;
drop policy if exists "Użytkownicy mogą aktualizować swoje generacje" on generations;

drop policy if exists "Użytkownicy mogą czytać swoje logi błędów" on generation_error_logs;
drop policy if exists "Użytkownicy mogą dodawać logi błędów" on generation_error_logs; 