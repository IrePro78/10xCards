-- Dodanie kolumn liczników do tabeli generations
alter table public.generations
add column generated_count integer not null default 0,
add column accepted_unedited_count integer not null default 0,
add column accepted_edited_count integer not null default 0,
add column generation_duration integer; -- czas w milisekundach

-- Dodanie indeksu dla kolumny generated_count
create index generations_generated_count_idx on public.generations(generated_count);

comment on column public.generations.generated_count is 'Liczba wygenerowanych fiszek w tej sesji';
comment on column public.generations.accepted_unedited_count is 'Liczba zaakceptowanych fiszek bez edycji';
comment on column public.generations.accepted_edited_count is 'Liczba zaakceptowanych fiszek po edycji';
comment on column public.generations.generation_duration is 'Czas generowania w milisekundach'; 