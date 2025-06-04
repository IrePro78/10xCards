# Specyfikacja Architektury Systemu Autentykacji - 10xCards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron i layoutów

#### Nowe strony wymagające implementacji

**Strona logowania (`/auth/login`):**

- **Lokalizacja:** `app/auth/login/page.tsx`
- **Typ:** Server Component z formą client-side
- **Komponenty:**
  - `LoginForm` (client component) - zawiera formularz logowania
  - `AuthLayout` - dedykowany layout dla stron autoryzacji
- **Pola formularza:**
  - Email (walidacja: format email, wymagane)
  - Hasło (walidacja: min. 6 znaków, wymagane)
  - Przycisk "Zaloguj się"
  - Link do rejestracji
  - Link do odzyskiwania hasła

**Strona rejestracji (`/auth/register`):**

- **Lokalizacja:** `app/auth/register/page.tsx`
- **Typ:** Server Component z formą client-side
- **Komponenty:**
  - `RegisterForm` (client component) - zawiera formularz rejestracji
- **Pola formularza:**
  - Email (walidacja: format email, wymagane, unikalne)
  - Hasło (walidacja: min. 8 znaków, jeden znak specjalny, jedna cyfra)
  - Potwierdzenie hasła (walidacja: zgodność z hasłem)
  - Przycisk "Zarejestruj się"
  - Link do logowania

**Strona odzyskiwania hasła (`/auth/forgot-password`):**

- **Lokalizacja:** `app/auth/forgot-password/page.tsx`
- **Typ:** Server Component z formą client-side
- **Komponenty:**
  - `ForgotPasswordForm` (client component)
- **Pola formularza:**
  - Email (walidacja: format email, wymagane)
  - Przycisk "Wyślij link resetujący"
  - Link powrotu do logowania

**Strona resetowania hasła (`/auth/reset-password`):**

- **Lokalizacja:** `app/auth/reset-password/page.tsx`
- **Typ:** Server Component z formą client-side
- **Komponenty:**
  - `ResetPasswordForm` (client component)
- **Pola formularza:**
  - Nowe hasło (walidacja j.w.)
  - Potwierdzenie nowego hasła
  - Przycisk "Zresetuj hasło"

#### Layout autoryzacji

**AuthLayout (`app/auth/layout.tsx`):**

- **Funkcjonalność:** Minimalistyczny layout dla stron auth bez głównej nawigacji
- **Struktura:**
  - Centrowane logo "10xCards"
  - Kontener formularza z odpowiednim stylowaniem
  - Toggle motywu (ciemny/jasny)
  - Brak głównej nawigacji MainNav

#### Modyfikacje istniejących komponentów

**MainNav (`src/components/MainNav.tsx`):**

- **Nowa funkcjonalność:** Dodanie sekcji użytkownika w prawym górnym rogu
- **Stan zalogowany:**
  - Avatar użytkownika (inicjały z email)
  - Dropdown menu zawierające:
    - "Profil" (link do `/profile`)
    - Separator
    - "Wyloguj się" (server action)
- **Stan niezalogowany:**
  - Przycisk "Zaloguj się" (link do `/auth/login`)

**Layout główny (`app/layout.tsx`):**

- **Nowa funkcjonalność:** Rozszerzenie o AuthProvider
- **Komponenty:**
  - Dodanie `<AuthProvider>` owijającego całą aplikację
  - Kontekst autentykacji dostępny globalnie

### 1.2 Komponenty Client-Side

#### AuthProvider (`src/components/AuthProvider.tsx`)

**Odpowiedzialność:**

- Zarządzanie stanem autentykacji w aplikacji
- Śledzenie zmian sesji użytkownika
- Udostępnianie kontekstu autentykacji

**Funkcjonalności:**

- Hook `useAuth()` zwracający:
  - `user: User | null` - informacje o użytkowniku
  - `loading: boolean` - stan ładowania
  - `signOut: () => Promise<void>` - funkcja wylogowania

**Implementacja:**

- React Context + useState/useEffect
- Nasłuchiwanie na `onAuthStateChange` z Supabase
- Automatic redirect handling

#### UserMenu (`src/components/UserMenu.tsx`)

**Odpowiedzialność:**

- Wyświetlanie menu użytkownika w NavBar
- Obsługa dropdown menu dla zalogowanego użytkownika

**Funkcjonalności:**

- Avatar z inicjałami użytkownika
- Dropdown z opcjami nawigacji
- Server action dla wylogowania

#### AuthForms (`src/components/auth/`)

**LoginForm (`src/components/auth/LoginForm.tsx`):**

- Client component z React Hook Form + Zod validation
- Integracja z Supabase Auth
- Error handling i loading states
- Server actions dla logowania

**RegisterForm (`src/components/auth/RegisterForm.tsx`):**

- Client component z React Hook Form + Zod validation
- Walidacja po stronie klienta i serwera
- Konfirmacja email po rejestracji

**ForgotPasswordForm, ResetPasswordForm:**

- Analogiczna struktura jak powyżej
- Dedicated validation schemas

### 1.3 Komponenty Server-Side

#### Strony autentykacji

**Wszystkie strony w `/auth/*`:**

- Server Components z lazy loading client forms
- Weryfikacja stanu autentykacji po stronie serwera
- Automatic redirects dla zalogowanych użytkowników
- SEO metadata dla każdej strony

#### Zabezpieczone strony

**Modyfikacje istniejących stron:**

- Dodanie middleware do weryfikacji autentykacji
- Server-side sprawdzanie uprawnień
- Graceful handling dla niezalogowanych użytkowników

### 1.4 Walidacja i komunikaty błędów

#### Schematy walidacji (Zod)

**AuthSchema:**

```typescript
- loginSchema: email + password
- registerSchema: email + password + confirmPassword
- forgotPasswordSchema: email
- resetPasswordSchema: password + confirmPassword
```

**Walidacja Client-Side:**

- Real-time validation podczas wpisywania
- Inline error messages pod polami
- Disabled submit button gdy form invalid

**Walidacja Server-Side:**

- Weryfikacja wszystkich danych w route handlers
- Custom error messages dla różnych przypadków
- Rate limiting dla prób logowania

#### Komunikaty błędów

**Typy błędów:**

- Validation errors (inline pod polami)
- Authentication errors (toast notifications)
- Network errors (toast notifications)

### 1.5 Najważniejsze scenariusze UX

#### Scenariusz 1: Pierwsza wizyta niezalogowanego użytkownika

1. Użytkownik może przeglądać fiszki bez ograniczeń
2. Przy próbie dodania/edycji → redirect do `/auth/login`
3. Informacja o konieczności logowania (toast)
4. Po zalogowaniu → powrót do oryginalnej akcji

#### Scenariusz 2: Rejestracja nowego użytkownika

1. Formularz rejestracji z walidacją real-time
2. Po rejestracji → email konfirmacyjny
3. Przekierowanie do strony potwierdzenia
4. Po potwierdzeniu → automatyczne logowanie

#### Scenariusz 3: Zapomiane hasło

1. Link z formularza logowania
2. Podanie email → wysłanie linka
3. Kliknięcie w link → strona resetowania
4. Nowe hasło → automatyczne logowanie

#### Scenariusz 4: Sesja expired

1. Automatic silent refresh w background
2. Jeśli refresh fails → soft logout
3. Toast o konieczności ponownego logowania
4. Redirect do login z return URL

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

#### Route Handlers w App Router

**Lokalizacja:** `app/api/auth/`

**POST `/api/auth/login`:**

- **Lokalizacja:** `app/api/auth/login/route.ts`
- **Funkcjonalność:** Logowanie użytkownika
- **Input:** `{ email: string, password: string }`
- **Output:** `{ user: User, session: Session }` lub error
- **Walidacja:** Zod schema validation
- **Error handling:** Custom error messages

**POST `/api/auth/register`:**

- **Lokalizacja:** `app/api/auth/register/route.ts`
- **Funkcjonalność:** Rejestracja nowego użytkownika
- **Input:** `{ email: string, password: string, confirmPassword: string }`
- **Output:** `{ message: string }` (confirmation needed)
- **Dodatkowa logika:** Sprawdzenie unikalności email

**POST `/api/auth/logout`:**

- **Lokalizacja:** `app/api/auth/logout/route.ts`
- **Funkcjonalność:** Wylogowanie użytkownika
- **Input:** Brak (sesja z cookies)
- **Output:** `{ success: boolean }`

**POST `/api/auth/forgot-password`:**

- **Lokalizacja:** `app/api/auth/forgot-password/route.ts`
- **Funkcjonalność:** Wysłanie linku resetującego hasło
- **Input:** `{ email: string }`
- **Output:** `{ message: string }`

**POST `/api/auth/reset-password`:**

- **Lokalizacja:** `app/api/auth/reset-password/route.ts`
- **Funkcjonalność:** Reset hasła z tokenem
- **Input:** `{ token: string, password: string, confirmPassword: string }`
- **Output:** `{ message: string }`

### 2.2 Server Actions

**Lokalizacja:** `src/lib/actions/auth.ts`

**signInAction:**

- Server Action dla formularza logowania
- Input validation z Zod
- Supabase Auth integration
- Automatic redirect handling

**signUpAction:**

- Server Action dla formularza rejestracji
- Email uniqueness check
- Error handling z appropriate messages

**signOutAction:**

- Server Action dla wylogowania
- Session cleanup
- Redirect do strony głównej

**forgotPasswordAction:**

- Server Action dla odzyskiwania hasła
- Email sending via Supabase Auth

### 2.3 Mechanizm walidacji danych

#### Input Validation

**Client-side validation:**

- React Hook Form z Zod resolvers
- Real-time validation feedback
- Wyłączenie przycisku submit gdy invalid

**Server-side validation:**

- Ponowna walidacja wszystkich danych
- Centralized validation w route handlers
- Custom error responses

### 2.5 Middleware i ochrona tras

#### Auth Middleware

**Lokalizacja:** `src/middleware/auth.ts`

**Funkcjonalność:**

- Weryfikacja sesji użytkownika
- Automatic token refresh
- Protected routes handling
- Redirect logic dla unauthorized users

**Konfiguracja middleware (`src/middleware/index.ts`):**

- Rozszerzenie obecnego middleware
- Matcher patterns dla chronionych tras
- Performance optimizations

#### Protected Routes

**Chronionych trasy:**

- `/flashcards/*` - zarządzanie fiszkami
- `/profile` - profil użytkownika
- `/api/flashcards/*` - API fiszek
- `/api/generations/*` - API generowania

**Public routes:**

- `/` - strona główna (przeglądanie)
- `/auth/*` - strony autentykacji
- Statyczne zasoby

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

#### Konfiguracja Supabase Client

**Lokalizacja:** `src/db/supabase.client.ts`

**Rozszerzenia:**

- Dodanie auth-specific configuration
- Custom auth event handlers
- Session persistence strategies

**Auth Settings:**

- Email confirmation włączone
- Password reset włączony
- Session timeout: 24h
- Remember me functionality

#### Auth Helpers

**Lokalizacja:** `src/lib/auth/`

**supabase-helpers.ts:**

- `getUser()` - pobieranie aktualnego użytkownika
- `getSession()` - pobieranie aktualnej sesji
- `requireAuth()` - helper dla protected routes
- `redirectToLogin()` - redirect logic

**server-helpers.ts:**

- Server-side auth helpers
- Session verification w Server Components
- User data fetching w route handlers

### 3.2 User Management

#### User Profile Management

**Rozszerzenie tabeli w bazie danych:**

- Dodanie kolumn do `auth.users` (jeśli możliwe) lub
- Nowa tabela `user_profiles` z foreign key do `auth.users`

**Pola profilu:**

- `id` (UUID) - primary key
- `email` - email użytkownika
- `created_at` - data rejestracji
- `updated_at` - data ostatniej aktualizacji
- `avatar_url` - opcjonalny avatar

### 3.4 Email Integration

#### Email Templates

**Konfiguracja w Supabase:**

- Welcome email po rejestracji
- Password reset email
- Email change confirmation
- Custom branding dla 10xCards

**Template customization:**

- Logo 10xCards w emailach
- Consistent styling z aplikacją
- Clear call-to-action buttons
- Polish language support

### 3.6 Migration Strategy

#### Database Changes

**Wymagane migracje:**

- RLS policies dla user-specific data
- Indeksy dla performance
- Triggers dla automated timestamps

**Lokalizacja:** `supabase/migrations/`

**Migration files:**

- `20241201000000_add_auth_policies.sql`
- `20241201000001_update_flashcards_rls.sql`
- `20241201000002_add_user_profiles.sql`

#### Backward Compatibility

**Zachowanie kompatybilności:**

- Wszystkie istniejące fiszki przypisane do domyślnego user_id
- Możliwość migracji anonymous data po zalogowaniu
- Graceful degradation dla niezalogowanych użytkowników

#### Deployment Strategy

**Etapy wdrażania:**

1. Wdrożenie migracji bazy danych
2. Deploy backend changes (API routes)
3. Deploy frontend changes (UI components)
4. Enable auth enforcement
5. Monitor i fix issues

## 4. PRZYKŁADOWE KONTRAKTY I INTERFEJSY

### 4.1 TypeScript Interfaces

```typescript
// src/types/auth.ts
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user?: User;
  session?: Session;
  error?: string;
}
```

### 4.2 API Contracts

```typescript
// src/lib/api/auth.ts
type LoginEndpoint = {
  method: 'POST';
  path: '/api/auth/login';
  body: LoginRequest;
  response: AuthResponse;
};

type RegisterEndpoint = {
  method: 'POST';
  path: '/api/auth/register';
  body: RegisterRequest;
  response: { message: string };
};
```

### 4.3 Validation Schemas

```typescript
// src/lib/validations/auth.ts
export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę')
    .regex(/[^a-zA-Z0-9]/, 'Hasło musi zawierać co najmniej jeden znak specjalny'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła muszą być identyczne',
  path: ['confirmPassword'],
});
```

## 5. INTEGRATION POINTS

### 5.1 Integracja z istniejącymi funkcjonalnościami

#### Fiszki (Flashcards)

- Dodanie `user_id` constraint w operacjach CRUD
- RLS policies ograniczające dostęp do własnych fiszek
- Migration dla existing flashcards
