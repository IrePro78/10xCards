-- Reset i utworzenie schematu bazy danych dla aplikacji 10xCards
-- Data: 2025-06-09

-- Usunięcie istniejących tabel (w odwrotnej kolejności ze względu na zależności)
drop table if exists public.generation_error_logs;
drop table if exists public.flashcards;
drop table if exists public.generations;

-- Tabela generations - przechowuje informacje o sesjach generowania fiszek
create table public.generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    model varchar(50) not null,
    generated_count integer not null default 0,
    accepted_unedited_count integer not null default 0,
    accepted_edited_count integer not null default 0,
    source_text_hash varchar(64) not null,
    source_text_length integer not null,
    generation_duration integer null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela flashcards - przechowuje fiszki użytkowników
create table public.flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    generation_id uuid references public.generations(id) on delete set null,
    front varchar(200) not null check (length(front) <= 200),
    back varchar(500) not null check (length(back) <= 500),
    source varchar(10) not null check (source in ('ai', 'manual', 'import')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela generation_error_logs - przechowuje logi błędów generacji
create table public.generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    model varchar(50) not null,
    source_text_hash varchar(64) not null,
    source_text_length integer not null,
    error_code varchar(50) null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Włączenie Row Level Security dla wszystkich tabel
alter table public.generations enable row level security;
alter table public.flashcards enable row level security;
alter table public.generation_error_logs enable row level security;

-- Polityki RLS dla tabeli generations
create policy "Użytkownicy mogą czytać tylko swoje generacje"
    on public.generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje generacje"
    on public.generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje generacje"
    on public.generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje generacje"
    on public.generations for delete
    to authenticated
    using (auth.uid() = user_id);

-- Polityki RLS dla tabeli flashcards
create policy "Użytkownicy mogą czytać tylko swoje fiszki"
    on public.flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje fiszki"
    on public.flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje fiszki"
    on public.flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje fiszki"
    on public.flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Polityki RLS dla tabeli generation_error_logs
create policy "Użytkownicy mogą czytać tylko swoje logi błędów"
    on public.generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje logi błędów"
    on public.generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Indeksy dla poprawy wydajności
create index generations_user_id_idx on public.generations(user_id);
create index generations_created_at_idx on public.generations(created_at);

create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_generation_id_idx on public.flashcards(generation_id);
create index flashcards_created_at_idx on public.flashcards(created_at);

create index generation_error_logs_user_id_idx on public.generation_error_logs(user_id);

-- Triggery dla automatycznej aktualizacji updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_generations_updated_at
    before update on public.generations
    for each row
    execute function update_updated_at();

create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function update_updated_at(); 