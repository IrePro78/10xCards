-- Aktualizacja funkcji delete_user, aby fizycznie usuwała konto
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
begin
    -- Pobierz ID aktualnego użytkownika
    v_user_id := auth.uid();
    
    if v_user_id is null then
        raise exception 'Nie znaleziono użytkownika';
    end if;

    -- Usuń wszystkie dane użytkownika z tabel
    delete from public.flashcards where user_id = v_user_id;
    
    -- Usuń konto użytkownika
    delete from auth.users where id = v_user_id;
end;
$$;

-- Nadaj uprawnienia do usuwania z tabeli auth.users
grant usage on schema auth to authenticated;
grant delete on auth.users to authenticated; 