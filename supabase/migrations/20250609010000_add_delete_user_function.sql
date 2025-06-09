-- Funkcja do usuwania konta użytkownika wraz z powiązanymi danymi
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
begin
    -- Pobierz ID aktualnie zalogowanego użytkownika
    v_user_id := auth.uid();
    
    if v_user_id is null then
        raise exception 'Nie znaleziono użytkownika';
    end if;

    -- Usuń wszystkie powiązane dane użytkownika
    -- Dzięki kaskadowemu usuwaniu (ON DELETE CASCADE), 
    -- automatycznie zostaną usunięte powiązane rekordy z tabel:
    -- - flashcards
    -- - generations
    -- - generation_error_logs
    
    -- Na końcu usuń konto użytkownika z auth.users
    -- To spowoduje wylogowanie użytkownika i uniemożliwi ponowne logowanie
    delete from auth.users where id = v_user_id;
end;
$$; 