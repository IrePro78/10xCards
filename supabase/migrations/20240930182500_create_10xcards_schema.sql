-- -----------------------------------------------------------------------------
-- Nazwa migracji: Utworzenie schematu bazy danych dla aplikacji 10xCards
-- Data utworzenia: 2024-09-30
-- Autor: Claude
-- 
-- Opis:
-- Ta migracja tworzy kompletny schemat bazy danych dla aplikacji 10xCards,
-- w tym tabele dla fiszek, generacji AI i logów błędów. Ustanawia również
-- relacje między tabelami, indeksy, zasady bezpieczeństwa na poziomie wierszy
-- oraz wyzwalacze do automatycznej aktualizacji pól czasowych.
-- -----------------------------------------------------------------------------

-- Włączenie rozszerzenia uuid-ossp do generowania identyfikatorów UUID
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Tabela: flashcards
-- Opis: Przechowuje fiszki użytkowników z pytaniami i odpowiedziami
-- -----------------------------------------------------------------------------
create table if not exists flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front varchar(200) not null check (length(front) <= 200),
    back varchar(500) not null check (length(back) <= 500),
    status varchar(20) not null check (status in ('pending', 'accepted', 'rejected')),
    source varchar(10) not null check (source in ('ai', 'user')),
    next_review_at timestamp,
    review_count integer not null default 0,
    easiness_factor numeric not null default 2.5 check (easiness_factor >= 1.0),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

-- komentarz do tabeli
comment on table flashcards is 'Przechowuje fiszki użytkowników z pytaniami i odpowiedziami';
comment on column flashcards.id is 'Unikalny identyfikator fiszki';
comment on column flashcards.user_id is 'Powiązanie z użytkownikiem';
comment on column flashcards.front is 'Przód fiszki (pytanie)';
comment on column flashcards.back is 'Tył fiszki (odpowiedź)';
comment on column flashcards.status is 'Status fiszki (pending, accepted, rejected)';
comment on column flashcards.source is 'Źródło utworzenia fiszki (ai, user)';
comment on column flashcards.next_review_at is 'Data następnej powtórki';
comment on column flashcards.review_count is 'Liczba wykonanych powtórek';
comment on column flashcards.easiness_factor is 'Współczynnik łatwości fiszki';
comment on column flashcards.created_at is 'Data utworzenia fiszki';
comment on column flashcards.updated_at is 'Data ostatniej aktualizacji fiszki';

-- indeksy dla tabeli flashcards
create index if not exists flashcards_user_id_idx on flashcards(user_id);
create index if not exists flashcards_created_at_idx on flashcards(created_at);
create index if not exists flashcards_next_review_at_idx on flashcards(next_review_at);
create index if not exists flashcards_user_id_status_idx on flashcards(user_id, status);

-- -----------------------------------------------------------------------------
-- Tabela: generations
-- Opis: Rejestruje informacje o generacjach fiszek przy użyciu AI
-- -----------------------------------------------------------------------------
create table if not exists generations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(50) not null,
    generated_count integer not null default 0,
    accepted_unedited_count integer not null default 0,
    accepted_edited_count integer not null default 0,
    source_text_hash varchar(64) not null,
    source_text_length integer not null,
    created_at timestamp not null default now()
);

-- komentarz do tabeli
comment on table generations is 'Rejestruje informacje o generacjach fiszek przy użyciu AI';
comment on column generations.id is 'Unikalny identyfikator generacji';
comment on column generations.user_id is 'Powiązanie z użytkownikiem';
comment on column generations.model is 'Nazwa modelu AI użytego do generacji';
comment on column generations.generated_count is 'Liczba wygenerowanych fiszek';
comment on column generations.accepted_unedited_count is 'Liczba zaakceptowanych fiszek bez edycji';
comment on column generations.accepted_edited_count is 'Liczba zaakceptowanych fiszek po edycji';
comment on column generations.source_text_hash is 'Hash tekstu źródłowego';
comment on column generations.source_text_length is 'Długość tekstu źródłowego';
comment on column generations.created_at is 'Data generacji';

-- indeksy dla tabeli generations
create index if not exists generations_user_id_idx on generations(user_id);
create index if not exists generations_created_at_idx on generations(created_at);

-- -----------------------------------------------------------------------------
-- Tabela: generation_error_logs
-- Opis: Rejestruje błędy występujące podczas generacji fiszek
-- -----------------------------------------------------------------------------
create table if not exists generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(50) not null,
    source_text_hash varchar(64) not null,
    source_text_length integer not null,
    error_code varchar(50),
    error_message text not null,
    created_at timestamp not null default now()
);

-- komentarz do tabeli
comment on table generation_error_logs is 'Rejestruje błędy występujące podczas generacji fiszek';
comment on column generation_error_logs.id is 'Unikalny identyfikator błędu';
comment on column generation_error_logs.user_id is 'Powiązanie z użytkownikiem';
comment on column generation_error_logs.model is 'Nazwa modelu AI';
comment on column generation_error_logs.source_text_hash is 'Hash tekstu źródłowego';
comment on column generation_error_logs.source_text_length is 'Długość tekstu źródłowego';
comment on column generation_error_logs.error_code is 'Kod błędu';
comment on column generation_error_logs.error_message is 'Treść komunikatu błędu';
comment on column generation_error_logs.created_at is 'Data wystąpienia błędu';

-- indeks dla tabeli generation_error_logs
create index if not exists generation_error_logs_user_id_idx on generation_error_logs(user_id);

-- -----------------------------------------------------------------------------
-- Wyzwalacze (Triggers) dla automatycznej aktualizacji pól czasowych
-- -----------------------------------------------------------------------------

-- funkcja do aktualizacji updated_at dla tabeli flashcards
create or replace function update_flashcards_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- wyzwalacz do aktualizacji updated_at dla tabeli flashcards
create trigger update_flashcards_updated_at_trigger
before update on flashcards
for each row
execute function update_flashcards_updated_at();

-- -----------------------------------------------------------------------------
-- Zabezpieczenia Row Level Security (RLS)
-- -----------------------------------------------------------------------------

-- włączenie RLS dla tabeli flashcards
alter table flashcards enable row level security;

-- polityki RLS dla tabeli flashcards

-- polityka select - użytkownik może przeglądać tylko swoje fiszki
create policy flashcards_select_policy_for_authenticated
on flashcards
for select
to authenticated
using (user_id = auth.uid());

-- polityka select dla anonimowych użytkowników - brak dostępu
create policy flashcards_select_policy_for_anon
on flashcards
for select
to anon
using (false);

-- polityka insert - użytkownik może dodawać fiszki tylko do własnego konta
create policy flashcards_insert_policy_for_authenticated
on flashcards
for insert
to authenticated
with check (user_id = auth.uid());

-- polityka insert dla anonimowych użytkowników - brak dostępu
create policy flashcards_insert_policy_for_anon
on flashcards
for insert
to anon
with check (false);

-- polityka update - użytkownik może aktualizować tylko swoje fiszki
create policy flashcards_update_policy_for_authenticated
on flashcards
for update
to authenticated
using (user_id = auth.uid());

-- polityka update dla anonimowych użytkowników - brak dostępu
create policy flashcards_update_policy_for_anon
on flashcards
for update
to anon
using (false);

-- polityka delete - użytkownik może usuwać tylko swoje fiszki
create policy flashcards_delete_policy_for_authenticated
on flashcards
for delete
to authenticated
using (user_id = auth.uid());

-- polityka delete dla anonimowych użytkowników - brak dostępu
create policy flashcards_delete_policy_for_anon
on flashcards
for delete
to anon
using (false);

-- włączenie RLS dla tabeli generations
alter table generations enable row level security;

-- polityki RLS dla tabeli generations

-- polityka select - użytkownik może przeglądać tylko swoje generacje
create policy generations_select_policy_for_authenticated
on generations
for select
to authenticated
using (user_id = auth.uid());

-- polityka select dla anonimowych użytkowników - brak dostępu
create policy generations_select_policy_for_anon
on generations
for select
to anon
using (false);

-- polityka insert - użytkownik może dodawać generacje tylko do własnego konta
create policy generations_insert_policy_for_authenticated
on generations
for insert
to authenticated
with check (user_id = auth.uid());

-- polityka insert dla anonimowych użytkowników - brak dostępu
create policy generations_insert_policy_for_anon
on generations
for insert
to anon
with check (false);

-- polityka update - użytkownik może aktualizować tylko swoje generacje
create policy generations_update_policy_for_authenticated
on generations
for update
to authenticated
using (user_id = auth.uid());

-- polityka update dla anonimowych użytkowników - brak dostępu
create policy generations_update_policy_for_anon
on generations
for update
to anon
using (false);

-- polityka delete - użytkownik może usuwać tylko swoje generacje
create policy generations_delete_policy_for_authenticated
on generations
for delete
to authenticated
using (user_id = auth.uid());

-- polityka delete dla anonimowych użytkowników - brak dostępu
create policy generations_delete_policy_for_anon
on generations
for delete
to anon
using (false);

-- włączenie RLS dla tabeli generation_error_logs
alter table generation_error_logs enable row level security;

-- polityki RLS dla tabeli generation_error_logs

-- polityka select - użytkownik może przeglądać tylko swoje logi błędów
create policy generation_error_logs_select_policy_for_authenticated
on generation_error_logs
for select
to authenticated
using (user_id = auth.uid());

-- polityka select dla anonimowych użytkowników - brak dostępu
create policy generation_error_logs_select_policy_for_anon
on generation_error_logs
for select
to anon
using (false);

-- polityka insert - użytkownik może dodawać logi błędów tylko do własnego konta
create policy generation_error_logs_insert_policy_for_authenticated
on generation_error_logs
for insert
to authenticated
with check (user_id = auth.uid());

-- polityka insert dla anonimowych użytkowników - brak dostępu
create policy generation_error_logs_insert_policy_for_anon
on generation_error_logs
for insert
to anon
with check (false);

-- polityka update - użytkownik może aktualizować tylko swoje logi błędów
create policy generation_error_logs_update_policy_for_authenticated
on generation_error_logs
for update
to authenticated
using (user_id = auth.uid());

-- polityka update dla anonimowych użytkowników - brak dostępu
create policy generation_error_logs_update_policy_for_anon
on generation_error_logs
for update
to anon
using (false);

-- polityka delete - użytkownik może usuwać tylko swoje logi błędów
create policy generation_error_logs_delete_policy_for_authenticated
on generation_error_logs
for delete
to authenticated
using (user_id = auth.uid());

-- polityka delete dla anonimowych użytkowników - brak dostępu
create policy generation_error_logs_delete_policy_for_anon
on generation_error_logs
for delete
to anon
using (false); 