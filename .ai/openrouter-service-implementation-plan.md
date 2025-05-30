# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa `OpenRouterService` stanowi warstwę pośrednią między Twoją aplikacją Next.js a API OpenRouter. Jej zadaniem jest:

- Ładowanie i walidacja konfiguracji (klucz API, URL, domyślny model).
- Formatowanie komunikatów (systemowego i użytkownika).
- Wysyłanie żądań HTTP do OpenRouter.
- Walidację i parsowanie odpowiedzi zgodnie z ustalonym schematem.
- Obsługę błędów sieciowych, API i walidacji.

## 2. Opis konstruktora

Konstruktor klasy przyjmuje opcjonalnie obiekt konfiguracji i automatycznie ładuje wartości środowiskowe.

```ts
interface OpenRouterConfig {
	apiKey?: string;
	baseUrl?: string;
	defaultModel?: string;
	defaultParams?: Record<string, any>;
}

class OpenRouterService {
	constructor(config?: OpenRouterConfig) {
		// ... ładowanie process.env.OPENROUTER_API_KEY itd. z Zod
	}
}
```

- `apiKey` – klucz API OpenRouter.
- `baseUrl` – punkt końcowy API (np. `https://api.openrouter.ai/v1/chat/completions`).
- `defaultModel` – domyślna nazwa modelu.
- `defaultParams` – domyślne parametry (temperature, max_tokens itd.).

## 3. Publiczne metody i pola

### `chatComplete(options)`

```ts
interface ChatOptions {
  systemMessage: string;
  userMessage: string;
  modelName?: string;
  modelParams?: Record<string, any>;
  responseFormat?: ResponseFormat;
}

async chatComplete<T>(options: ChatOptions): Promise<T> { /* ... */ }
```

- `systemMessage` – komunikat systemowy (rola `system`).
- `userMessage` – treść od użytkownika (rola `user`).
- `modelName` – nadpisanie domyślnego modelu.
- `modelParams` – parametry wywołania modelu.
- `responseFormat` – struktura JSON, np.:
  ```ts
  {
    type: 'json_schema',
    json_schema: {
      name: 'ChatResponse',
      strict: true,
      schema: { /* JSON Schema */ }
    }
  }
  ```

## 4. Prywatne metody i pola

- `buildPayload(options: ChatOptions)` – łączy system & user message, modelName, params oraz response_format.
- `sendRequest(payload)` – wykonuje fetch z nagłówkiem `Authorization: Bearer ${apiKey}` i czeka na odpowiedź.
- `validateResponse(raw)` – waliduje przez Zod pod `responseFormat.json_schema.schema`.
- `handleError(error)` – rzuca klasy NetworkError, ApiError lub ValidationError.

## 5. Obsługa błędów

1. NetworkError – timeout, brak połączenia.
2. ApiError – status HTTP 4xx/5xx, body z `error.message`.
3. ValidationError – niezgodna struktura JSON.
4. UnexpectedError – puste body, nieznany format.

Każdy błąd powinien być odpowiednio typowany i zawierać:

- kod (`error.code`),
- wiadomość (`error.message`),
- data dodatkowe (`error.details`).

## 6. Kwestie bezpieczeństwa

- **Ukrywanie klucza API**: dostęp do `process.env` tylko po stronie serwera.
- **Ochrona przed nadużyciami**: limitowanie wywołań, retry z backoff.
- **Walidacja input**: sanitizacja treści komunikatów.
- **Maskowanie logów**: nie logować pełnych wartości `apiKey`.

## 7. Plan wdrożenia krok po kroku

1. **Zainstaluj zależności**:
   ```bash
   npm install zod
   ```
2. **Dodaj zmienne środowiskowe** w `.env`:
   ```env
   OPENROUTER_API_KEY=twój_klucz
   OPENROUTER_URL=https://api.openrouter.ai/v1/chat/completions
   DEFAULT_MODEL=gpt-4o-mini
   DEFAULT_PARAMS={"temperature":0.7,"max_tokens":512}
   ```
3. **Utwórz plik usługi** `src/lib/openrouter.service.ts` i zaimplementuj klasę zgodnie z powyższymi sekcjami.
4. **Walidacja zmiennych** – użyj Zod do wczytywania `OPENROUTER_API_KEY` i `OPENROUTER_URL`.
5. **Formatowanie payload** – zaimplementuj `buildPayload` z polami:
   - `messages`:
     ```ts
     [
     	{ role: 'system', content: options.systemMessage },
     	{ role: 'user', content: options.userMessage },
     ];
     ```
   - `model`: `options.modelName || defaultModel`
   - parametry: `{ ...defaultParams, ...options.modelParams }`
   - `response_format`: `options.responseFormat`
6. **Wysyłanie żądania** – użyj `fetch` lub biblioteki `undici`, ustaw nagłówki `Content-Type: application/json` i `Authorization`.
7. **Walidacja odpowiedzi** – po `await response.json()` wyrzuć `ApiError` przy kodzie ≠ 200, a następnie użyj Zod:
   ```ts
   const schema = zod.object(
   	options.responseFormat.json_schema.schema,
   );
   return schema.parse(raw.choices[0].message.content);
   ```
8. **Dodaj retry/backoff** – dla błędów sieciowych i 429.
9. **Integracja w Next.js** – wywołuj `chatComplete` w route handlerach (`app/api/chat/route.ts`) lub w server actions.

---

_Przykładowe wywołanie w `app/api/chat/route.ts`:_

```ts
import { NextResponse } from 'next/server';
import { OpenRouterService } from '@/lib/openrouter.service';

export async function POST(request: Request) {
	const { message } = await request.json();
	const service = new OpenRouterService();
	try {
		const reply = await service.chatComplete<{
			reply: string;
			usage: { prompt_tokens: number; completion_tokens: number };
		}>({
			systemMessage: 'You are assistant.',
			userMessage: message,
			responseFormat: {
				type: 'json_schema',
				json_schema: {
					name: 'ChatResponse',
					strict: true,
					schema: {
						type: 'object',
						properties: {
							reply: { type: 'string' },
							usage: {
								type: 'object',
								properties: {
									prompt_tokens: { type: 'number' },
									completion_tokens: { type: 'number' },
								},
								required: ['prompt_tokens', 'completion_tokens'],
							},
						},
						required: ['reply', 'usage'],
					},
				},
			},
		});
		return NextResponse.json(reply);
	} catch (error) {
		return NextResponse.json(
			{ error: error.message },
			{ status: error.code || 500 },
		);
	}
}
```

---

Teraz usługa OpenRouter jest gotowa do użycia w Twojej aplikacji Next.js 15 z TypeScript 5 i Tailwind CSS.
