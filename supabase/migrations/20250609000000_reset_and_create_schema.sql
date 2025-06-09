-- Reset i utworzenie schematu bazy danych dla aplikacji 10xCards
-- Data: 2025-06-09

-- Usunięcie istniejących tabel (w odwrotnej kolejności ze względu na zależności)
drop table if exists public.generation_error_logs;
drop table if exists public.flashcards;
drop table if exists public.generations;
drop table if exists public.review_sessions;
drop table if exists public.review_answers;

-- Tabela generations - przechowuje informacje o sesjach generowania fiszek
create table public.generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    source_text text not null,
    status varchar(20) not null default 'pending',
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
    source varchar(10) not null check (source in ('ai', 'ai-edited', 'manual')),
    next_review_at timestamptz,
    review_count integer not null default 0,
    last_review_at timestamptz,
    ease_factor float not null default 2.5,
    interval_days integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela generation_error_logs - przechowuje logi błędów generacji
create table public.generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    generation_id uuid references public.generations(id) on delete cascade not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Tabela review_sessions - przechowuje informacje o sesjach powtórek
create table public.review_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    total_cards integer not null default 0,
    correct_answers integer not null default 0,
    incorrect_answers integer not null default 0
);

-- Tabela review_answers - przechowuje odpowiedzi z sesji powtórek
create table public.review_answers (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.review_sessions(id) on delete cascade not null,
    flashcard_id uuid references public.flashcards(id) on delete cascade not null,
    answer_quality integer not null check (answer_quality between 0 and 5),
    answer_time_ms integer not null,
    created_at timestamptz not null default now()
);

-- Włączenie Row Level Security dla wszystkich tabel
alter table public.generations enable row level security;
alter table public.flashcards enable row level security;
alter table public.generation_error_logs enable row level security;
alter table public.review_sessions enable row level security;
alter table public.review_answers enable row level security;

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
    using (auth.uid() = user_id);

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
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje fiszki"
    on public.flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Polityki RLS dla tabeli generation_error_logs
create policy "Użytkownicy mogą czytać logi błędów swoich generacji"
    on public.generation_error_logs for select
    to authenticated
    using (
        exists (
            select 1 from public.generations
            where id = generation_error_logs.generation_id
            and user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą tworzyć logi błędów dla swoich generacji"
    on public.generation_error_logs for insert
    to authenticated
    with check (
        exists (
            select 1 from public.generations
            where id = generation_id
            and user_id = auth.uid()
        )
    );

-- Polityki RLS dla tabeli review_sessions
create policy "Użytkownicy mogą czytać tylko swoje sesje powtórek"
    on public.review_sessions for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć swoje sesje powtórek"
    on public.review_sessions for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje sesje powtórek"
    on public.review_sessions for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje sesje powtórek"
    on public.review_sessions for delete
    to authenticated
    using (auth.uid() = user_id);

-- Polityki RLS dla tabeli review_answers
create policy "Użytkownicy mogą czytać odpowiedzi ze swoich sesji"
    on public.review_answers for select
    to authenticated
    using (
        exists (
            select 1 from public.review_sessions
            where id = review_answers.session_id
            and user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą dodawać odpowiedzi do swoich sesji"
    on public.review_answers for insert
    to authenticated
    with check (
        exists (
            select 1 from public.review_sessions
            where id = session_id
            and user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą aktualizować odpowiedzi ze swoich sesji"
    on public.review_answers for update
    to authenticated
    using (
        exists (
            select 1 from public.review_sessions
            where id = review_answers.session_id
            and user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą usuwać odpowiedzi ze swoich sesji"
    on public.review_answers for delete
    to authenticated
    using (
        exists (
            select 1 from public.review_sessions
            where id = review_answers.session_id
            and user_id = auth.uid()
        )
    );

-- Indeksy dla optymalizacji zapytań
create index generations_user_id_idx on public.generations(user_id);
create index generations_created_at_idx on public.generations(created_at);

create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_generation_id_idx on public.flashcards(generation_id);
create index flashcards_created_at_idx on public.flashcards(created_at);
create index flashcards_next_review_at_idx on public.flashcards(next_review_at);
create index flashcards_user_id_next_review_at_idx on public.flashcards(user_id, next_review_at);

create index generation_error_logs_generation_id_idx on public.generation_error_logs(generation_id);

create index review_sessions_user_id_started_at_idx on public.review_sessions(user_id, started_at);

create index review_answers_session_id_idx on public.review_answers(session_id);

-- Trigger do automatycznej aktualizacji updated_at
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