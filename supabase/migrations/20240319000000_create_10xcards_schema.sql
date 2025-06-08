-- Tworzenie schematu bazy danych dla aplikacji 10xCards

-- Tabela flashcards - przechowuje fiszki użytkowników
create table public.flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    front text not null,
    back text not null,
    source text not null check (source in ('ai', 'manual')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Włącz Row Level Security dla tabeli flashcards
alter table public.flashcards enable row level security;

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

-- Indeksy dla poprawy wydajności
create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_created_at_idx on public.flashcards(created_at);
create index flashcards_updated_at_idx on public.flashcards(updated_at); 