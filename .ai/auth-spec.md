**Specyfikacja Techniczna: Moduł Autentykacji Użytkowników (10xCards)**

## 1. Architektura Interfejsu Użytkownika

### 1.1. Nowe Strony (Routes)

W ramach App Routera Next.js zostaną utworzone następujące publicznie dostępne strony:

- **/login**: Strona logowania.
  - Dostępna dla niezalogowanych użytkowników.
  - Przekierowuje zalogowanych użytkowników na stronę główną (lub ostatnio odwiedzaną stronę wymagającą autentykacji).
- **/register**: Strona rejestracji.
  - Dostępna dla niezalogowanych użytkowników.
  - Przekierowuje zalogowanych użytkowników na stronę główną.
- **/forgot-password**: Strona umożliwiająca użytkownikowi zainicjowanie procesu odzyskiwania hasła.
  - Dostępna dla wszystkich użytkowników.
- **/reset-password**: Strona, na której użytkownik może ustawić nowe hasło po kliknięciu w link wysłany na jego adres e-mail.
  - Dostępna tylko poprzez specjalny, ograniczony czasowo link z tokenem.

### 1.2. Nowe i Zmodyfikowane Komponenty

#### 1.2.1. Komponenty UI (Client-Side)

Komponenty te będą zlokalizowane w `src/components/auth/` i zbudowane przy użyciu biblioteki `shadcn/ui`.

- **`LoginForm.tsx` (Client Component)**:
  - Pola: "Adres e-mail" (`Input`), "Hasło" (`Input type="password"`).
  - Przycisk: "Zaloguj się" (`Button`).
  - Linki:
    - "Nie masz konta? Zarejestruj się" (nawigacja do `/register`).
    - "Zapomniałeś hasła?" (nawigacja do `/forgot-password`).
  - Logika: Wykorzystanie `react-hook-form` do zarządzania stanem formularza i `zod` do walidacji po stronie klienta. Wywołanie Server Action do obsługi logowania. Wyświetlanie komunikatów o błędach (inline i ogólnych) oraz stanu ładowania.
- **`RegisterForm.tsx` (Client Component)**:
  - Pola: "Adres e-mail" (`Input`), "Hasło" (`Input type="password"`), "Potwierdź hasło" (`Input type="password"`).
  - Przycisk: "Zarejestruj się" (`Button`).
  - Link: "Masz już konto? Zaloguj się" (nawigacja do `/login`).
  - Logika: Analogicznie do `LoginForm.tsx`, walidacja zgodności haseł. Wywołanie Server Action do obsługi rejestracji.
- **`ForgotPasswordForm.tsx` (Client Component)**:
  - Pole: "Adres e-mail" (`Input`).
  - Przycisk: "Wyślij link do resetowania hasła" (`Button`).
  - Logika: Walidacja formatu adresu e-mail. Wywołanie Server Action. Wyświetlanie komunikatu o wysłaniu linku lub o błędzie.
- **`ResetPasswordForm.tsx` (Client Component)**:
  - Pola: "Nowe hasło" (`Input type="password"`), "Potwierdź nowe hasło" (`Input type="password"`).
  - Przycisk: "Ustaw nowe hasło" (`Button`).
  - Logika: Walidacja nowego hasła i jego potwierdzenia. Wywołanie Server Action, przekazując token resetujący (uzyskany z parametrów URL przez stronę serwerową). Wyświetlanie komunikatów.

#### 1.2.2. Modyfikacje Istniejących Komponentów/Layoutów

- **Główny Layout (np. `app/layout.tsx`) lub Komponent Nawigacji Głównej (np. `src/components/MainNav.tsx`):**
  - **Stan niezalogowany:**
    - Wyświetlanie przycisków/linków: "Zaloguj się" (do `/login`) i "Zarejestruj się" (do `/register`).
  - **Stan zalogowany:**
    - Wyświetlanie informacji o użytkowniku (np. inicjały, email lub docelowo avatar).
    - Rozwijane menu użytkownika (np. `DropdownMenu` z `shadcn/ui`) zawierające:
      - Link do strony "Ustawienia konta" (gdzie będzie m.in. zmiana hasła - US-005).
      - Przycisk "Wyloguj się", który wywołuje Server Action.
  - Logika renderowania warunkowego oparta na statusie sesji użytkownika, pobranej po stronie serwera.

### 1.3. Odpowiedzialność Komponentów (Client-Side vs Server-Side)

- **Formularze (Client Components):**
  - Zbieranie danych wejściowych od użytkownika.
  - Walidacja w czasie rzeczywistym (on-the-fly) oraz przy próbie wysłania formularza.
  - Wyświetlanie komunikatów o błędach walidacji bezpośrednio przy polach.
  - Zarządzanie stanem UI (np. `isLoading` na przyciskach).
  - Wywoływanie Server Actions do przetworzenia danych i interakcji z Supabase.
- **Strony (Server Components renderujące Client Components):**
  - Strony `/login`, `/register`, `/forgot-password` będą Server Components, które osadzają odpowiednie formularze klienckie.
  - Strona `/reset-password` (Server Component) odczyta token resetujący z parametrów URL i przekaże go jako props do komponentu `ResetPasswordForm.tsx`.
  - Obsługa przekierowań po pomyślnych operacjach (np. z Server Action przy użyciu `redirect` z `next/navigation`).

### 1.4. Walidacja i Komunikaty Błędów

- **Walidacja (Zod):**
  - **Klient:** Natychmiastowa informacja zwrotna dla użytkownika.
    - Email: wymagany, poprawny format.
    - Hasło: wymagane, minimalna długość (np. 8 znaków), opcjonalnie złożoność (np. wielka/mała litera, cyfra).
    - Potwierdzenie hasła: musi być zgodne z hasłem.
  - **Serwer (w Server Actions):** Ostateczna walidacja przed interakcją z bazą danych. Schematy Zod będą reużywane.
- **Komunikaty (wyświetlane np. przez `Toast` (Sonner) z `shadcn/ui` oraz inline):**
  - **Błędy inline:** Np. "To pole jest wymagane", "Niepoprawny format adresu e-mail", "Hasła nie są zgodne".
  - **Błędy ogólne/serwera:** Np. "Nieprawidłowy adres e-mail lub hasło", "Użytkownik o tym adresie e-mail już istnieje", "Link do resetowania hasła wygasł lub jest nieprawidłowy", "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
  - **Sukces:** Np. "Rejestracja zakończona. Możesz się teraz zalogować.", "Link do resetowania hasła został wysłany na Twój adres e-mail.", "Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować."

### 1.5. Obsługa Najważniejszych Scenariuszy

- **Rejestracja:** Użytkownik wypełnia formularz -> Walidacja (klient) -> Server Action: Walidacja (serwer) -> Supabase `signUp` -> Komunikat / Przekierowanie.
- **Logowanie:** Użytkownik wypełnia formularz -> Walidacja (klient) -> Server Action: Walidacja (serwer) -> Supabase `signInWithPassword` -> Komunikat / Przekierowanie / Ustanowienie sesji.
- **Żądanie Odzyskania Hasła:** Użytkownik podaje e-mail -> Walidacja (klient) -> Server Action: Walidacja (serwer) -> Supabase `resetPasswordForEmail` -> Komunikat.
- **Resetowanie Hasła:** Użytkownik klika link, przechodzi na `/reset-password` z tokenem -> Wprowadza nowe hasło -> Walidacja (klient) -> Server Action (z tokenem): Walidacja (serwer) -> Supabase `updateUser` (po wcześniejszym obsłużeniu zdarzenia `PASSWORD_RECOVERY` przez Supabase JS SDK) -> Komunikat / Przekierowanie.
- **Wylogowanie:** Użytkownik klika "Wyloguj" -> Server Action -> Supabase `signOut` -> Przekierowanie.

## 2. Logika Backendowa

Logika backendowa będzie implementowana głównie przy użyciu Next.js Server Actions, które bezpośrednio komunikują się z Supabase.

### 2.1. Struktura Endpointów API (Server Actions)

Zostaną zdefiniowane w plikach `actions/*.ts` (np. `app/actions/auth.ts`).

- `async function register(formData: FormData): Promise<ActionResult>`
- `async function login(formData: FormData): Promise<ActionResult>`
- `async function logout(): Promise<ActionResult>` (może nie zwracać nic lub tylko status przekierowania)
- `async function requestPasswordReset(formData: FormData): Promise<ActionResult>`
- `async function resetPassword(formData: FormData, token: string): Promise<ActionResult>` (token przekazany jako argument, nie z `formData`)

Gdzie `ActionResult` to typ opisujący wynik operacji, np. `{ success: boolean; message?: string; errors?: Record<string, string[]> }`.

### 2.2. Modele Danych (DTOs) i Walidacja

- Schematy Zod będą zdefiniowane w `src/lib/validators/auth.ts` (lub podobnej lokalizacji).
  - `RegisterSchema`, `LoginSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`.
- Każda Server Action rozpocznie się od walidacji `formData` przy użyciu odpowiedniego schematu Zod. W przypadku błędów walidacji, akcja zwróci obiekt `errors`.

### 2.3. Obsługa Wyjątków

- Błędy zwracane przez Supabase (np. `AuthApiError`) będą przechwytywane w blokach `try...catch` w Server Actions.
- Mapowanie błędów Supabase na przyjazne dla użytkownika komunikaty.
- Logowanie szczegółowych błędów po stronie serwera dla celów deweloperskich.

### 2.4. Aktualizacja Sposobu Renderowania Stron (Server-Side)

- **Dostęp do sesji użytkownika:** W Server Components oraz Server Actions, sesja użytkownika będzie pobierana przy użyciu serwerowego klienta Supabase (`@supabase/ssr`).
  ```typescript
  // Przykład w Server Component lub Server Action
  import { createClient } from '@/src/db/supabase.server'; // Założenie istnienia takiego helpera
  const supabase = createClient();
  const {
  	data: { user },
  } = await supabase.auth.getUser();
  ```
- **Ochrona tras:** Komponenty serwerowe odpowiedzialne za renderowanie stron wymagających autentykacji (np. edycja fiszek) będą sprawdzać obecność `user`. Jeśli użytkownik nie jest zalogowany, nastąpi przekierowanie do `/login` przy użyciu `redirect` z `next/navigation`.
- Strony takie jak `/login` i `/register` będą przekierowywać zalogowanych użytkowników na stronę główną.

## 3. System Autentykacji (Supabase Auth)

### 3.1. Wykorzystanie Supabase Auth

- **Rejestracja:** `supabase.auth.signUp({ email, password, options: { emailRedirectTo: '<URL_APLIKACJI_PO_POTWIERDZENIU_EMAILA>' } })`. Należy skonfigurować w Supabase, czy potwierdzenie e-mail jest wymagane. `emailRedirectTo` to URL, na który użytkownik zostanie przekierowany po kliknięciu linku w mailu potwierdzającym (jeśli włączone).
- **Logowanie:** `supabase.auth.signInWithPassword({ email, password })`.
- **Wylogowywanie:** `supabase.auth.signOut()`.
- **Żądanie Odzyskania Hasła:** `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<URL_APLIKACJI>/reset-password' })`. `redirectTo` to URL strony w aplikacji Next.js, gdzie użytkownik ustawi nowe hasło. Supabase automatycznie dołączy token do tego URL.
- **Resetowanie Hasła:** Po stronie `/reset-password`, Supabase JS SDK (uruchomione na kliencie) powinno wykryć zdarzenie `PASSWORD_RECOVERY` (jeśli token jest w URL). Następnie, Server Action wywołana przez `ResetPasswordForm` użyje `supabase.auth.updateUser({ password: newPassword })` do zmiany hasła.
- **Pobieranie danych użytkownika:** `supabase.auth.getUser()` w logice serwerowej; `supabase.auth.onAuthStateChange()` na kliencie, jeśli potrzebne są dynamiczne aktualizacje UI bez przeładowania (choć Server Actions i rewalidacja w Next.js mogą to zminimalizować).

### 3.2. Konfiguracja Supabase

- **URL-e:**
  - **Site URL:** Główny URL aplikacji (np. `http://localhost:3000` dla dewelopmentu, `https://twojadomena.com` dla produkcji).
  - **Redirect URLs:** Dodatkowe URL-e używane w przepływach OAuth lub przekierowaniach, np. `http://localhost:3000/auth/callback` (standardowy dla Supabase), `http://localhost:3000/reset-password`.
- **Szablony E-mail:** W panelu Supabase (Authentication -> Email Templates) dostosować szablony dla "Confirm signup", "Reset password", "Magic Link" (jeśli używany) do języka polskiego i poprawnego brandingu. Upewnić się, że linki w szablonach są prawidłowe.
- **Providerzy:** Włączyć "Email provider". Inni (Google, GitHub itp.) mają być wyłączeni zgodnie z US-008.
- **Potwierdzenie E-mail:** Zdecydować, czy włączyć opcję "Enable email confirmations". Jeśli tak, przepływ rejestracji musi to uwzględniać.
- **Security:**
  - Upewnić się, że włączone jest "Enable Row Level Security (RLS)" dla wszystkich tabel przechowujących dane użytkowników lub fiszki.
  - Zdefiniować odpowiednie RLS Policies.

### 3.3. Zarządzanie Sesją

- Biblioteka `@supabase/ssr` będzie używana do zarządzania sesją użytkownika poprzez cookies. Helper `createClient` (z `lib/supabase/server.ts` i `lib/supabase/client.ts`) ułatwi tworzenie instancji klienta Supabase odpowiednio dla kontekstu serwerowego i klienckiego.
- Middleware (`src/middleware.ts`) będzie odpowiedzialny za odświeżanie sesji Supabase przy każdym żądaniu, używając klienta Supabase SSR.

```typescript
  // src/middleware/index.ts (uproszczony przykład)
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
'/login',
'/register',
'/forgot-password',
'/reset-password',
];

export async function middleware(request: NextRequest) {
// Tworzymy nową odpowiedź z przekazanym requestem
let response = NextResponse.next({
request,
});

    response.headers.set('x-middleware-cache', 'no-cache');

    const supabase = createServerClient(
    	process.env.NEXT_PUBLIC_SUPABASE_URL!,
    	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    	{
    		cookies: {
    			getAll() {
    				return request.cookies.getAll();
    			},
    			setAll(cookiesToSet) {
    				cookiesToSet.forEach(({ name, value, options }) =>
    					request.cookies.set(name, value),
    				);
    				response = NextResponse.next({
    					request,
    				});
    				response.headers.set('x-middleware-cache', 'no-cache');
    				cookiesToSet.forEach(({ name, value, options }) =>
    					response.cookies.set(name, value, options),
    				);
    			},
    		},
    	},
    );

    // WAŻNE: Nie umieszczaj kodu między createServerClient a supabase.auth.getUser()
    // Prosty błąd może spowodować trudne do debugowania problemy z losowym wylogowywaniem użytkowników

    const {
    	data: { user },
    } = await supabase.auth.getUser();

    // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
    if (!user && !PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    	return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania/rejestracji
    if (user && PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    	return NextResponse.redirect(new URL('/generate', request.url));
    }

    // WAŻNE: Zwracamy response z zachowanymi ciasteczkami
    return response;

}

export const config = {
matcher: [
/\*

- Dopasuj wszystkie ścieżki żądań z wyjątkiem tych zaczynających się od:
- - \_next/static (pliki statyczne)
- - \_next/image (pliki optymalizacji obrazów)
- - favicon.ico (plik favicon)
- - ._\\.(?:svg|png|jpg|jpeg|gif|webp)$ (pliki graficzne)
    _/
    '/((?!\_next/static|\_next/image|favicon.ico|._\\.(?:svg|png|jpg|jpeg|gif|webp)$)._)',
    ],
    };
```

Kluczowe jest, aby `supabase.auth.getUser()` było wywoływane w middleware, aby sesja była aktualna i dostępna dla Server Components i Route Handlers poprzez cookies.
