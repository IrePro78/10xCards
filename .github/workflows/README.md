# GitHub Actions Workflows - Instrukcje uruchamiania

## 🚀 Szybkie uruchamianie

### Przez GitHub CLI

```bash
# Uruchom CI/CD Pipeline
gh workflow run ci-cd.yml

# Uruchom Supabase Management (staging)
gh workflow run supabase.yml -f environment=staging

# Uruchom Supabase Management (production)
gh workflow run supabase.yml -f environment=production

# Uruchom Security Scan
gh workflow run security.yml
```

### Przez GitHub UI

1. Przejdź do: `https://github.com/IrePro78/10xCards/actions`
2. Wybierz workflow z listy
3. Kliknij "Run workflow"
4. Wybierz branch i opcje
5. Kliknij "Run workflow"

## 📋 Konfiguracja wymagana

### Secrets (Settings → Secrets and variables → Actions)

```bash
# Supabase
SUPABASE_ACCESS_TOKEN=your_supabase_token
SUPABASE_STAGING_PROJECT_ID=your_staging_project_id
SUPABASE_PRODUCTION_PROJECT_ID=your_production_project_id
```

### Environments (Settings → Environments)

Utwórz środowiska:

- `staging`
- `production`

## 🔄 Scenariusze automatyczne

### Przy push na main:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

**Uruchamia:** CI/CD Pipeline + Security Scan

### Przy zmianach w migracjach:

```bash
git add supabase/migrations/
git commit -m "Add database migration"
git push origin main
```

**Uruchamia:** Supabase Management (staging)

### Codziennie o 2:00 UTC:

**Uruchamia:** Security Scan (automatycznie)

## 🛠️ Rozwiązywanie problemów

### Sprawdzenie statusu workflowów:

```bash
# Lista workflowów
gh workflow list

# Status ostatnich uruchomień
gh run list

# Szczegóły konkretnego uruchomienia
gh run view [RUN_ID]
```

### Pobranie logów:

```bash
# Pobierz logi ostatniego uruchomienia
gh run download [RUN_ID]

# Wyświetl logi na żywo
gh run watch [RUN_ID]
```
