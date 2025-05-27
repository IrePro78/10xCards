import { z } from 'zod';
import {
	OpenRouterConfig,
	ChatOptions,
	ModelParameters,
	ErrorDetails,
	ApiResponse,
	ResponseFormat,
} from '../types/openrouter.types';
import { GenerationCandidateDto } from '@/types/types';

// Schemat walidacji konfiguracji środowiskowej
const envSchema = z.object({
	OPENROUTER_API_KEY: z.string().min(1, 'API key is required'),
	OPENROUTER_URL: z.string().url('Invalid API URL'),
	DEFAULT_MODEL: z.string().min(1, 'Default model is required'),
	DEFAULT_PARAMS: z.string().transform((str) => {
		try {
			return JSON.parse(str) as ModelParameters;
		} catch {
			throw new Error('Invalid DEFAULT_PARAMS JSON');
		}
	}),
});

// Schemat walidacji parametrów wejściowych
const chatOptionsSchema = z.object({
	systemMessage: z.string().min(1, 'System message is required'),
	userMessage: z.string().min(1, 'User message is required'),
	modelName: z.string().optional(),
	modelParams: z
		.object({
			temperature: z.number().min(0).max(2).optional(),
			max_tokens: z.number().min(1).max(4096).optional(),
			top_p: z.number().min(0).max(1).optional(),
			frequency_penalty: z.number().min(-2).max(2).optional(),
			presence_penalty: z.number().min(-2).max(2).optional(),
		})
		.optional(),
	responseFormat: z
		.object({
			type: z.literal('json_schema'),
			json_schema: z.object({
				name: z.string(),
				strict: z.boolean(),
				schema: z.record(z.unknown()),
			}),
		})
		.optional(),
});

// Predefiniowane formaty odpowiedzi
export const RESPONSE_FORMATS = {
	FLASHCARDS: {
		type: 'json_schema' as const,
		json_schema: {
			name: 'FlashcardsResponse',
			strict: true,
			schema: {
				type: 'object',
				additionalProperties: false,
				properties: {
					flashcards: {
						type: 'array',
						items: {
							type: 'object',
							additionalProperties: false,
							properties: {
								front: { type: 'string' },
								back: { type: 'string' },
							},
							required: ['front', 'back'],
						},
					},
				},
				required: ['flashcards'],
			},
		},
	},
} as const;

// Predefiniowane prompty systemowe
export const SYSTEM_PROMPTS = {
	FLASHCARDS_GENERATOR: `Jesteś ekspertem w tworzeniu fiszek edukacyjnych. 
Twoim zadaniem jest przeanalizowanie podanego tekstu i wygenerowanie zestawu fiszek.
Każda fiszka powinna:
1. Zawierać kluczowe pojęcie lub koncepcję na froncie
2. Mieć zwięzłe ale dokładne wyjaśnienie na odwrocie
3. Być samodzielna - zrozumiała bez kontekstu innych fiszek
4. Skupiać się na jednym konkretnym zagadnieniu

Odpowiedź MUSI być w formacie JSON zgodnym ze schematem:
{
  "flashcards": [
    { "front": "pojęcie/pytanie", "back": "definicja/odpowiedź" }
  ]
}`,
} as const;

// Schemat Zod dla walidacji fiszek
const flashcardsResponseSchema = z.object({
	flashcards: z.array(
		z.object({
			front: z.string(),
			back: z.string(),
		}),
	),
});

// Klasy błędów
export class NetworkError extends Error {
	constructor(
		message: string,
		public code: number = 503,
		public details?: ErrorDetails,
	) {
		super(message);
		this.name = 'NetworkError';
	}
}

export class ApiError extends Error {
	constructor(
		message: string,
		public code: number,
		public details?: ErrorDetails,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class ValidationError extends Error {
	constructor(
		message: string,
		public code: number = 400,
		public details?: ErrorDetails,
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

interface ExtendedError extends Error {
	code?: number;
	details?: ErrorDetails;
}

export class OpenRouterService {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly defaultModel: string;
	private readonly defaultParams: ModelParameters;
	private readonly maxRetries = 3;
	private readonly baseDelay = 1000; // 1 sekunda
	private readonly sensitiveKeys = ['apiKey', 'Authorization'];

	// Rate limiting
	private readonly maxRequestsPerMinute = 60;
	private requestCount = 0;
	private requestTimestamps: number[] = [];

	// Cache
	private readonly cache = new Map<
		string,
		{ data: unknown; timestamp: number }
	>();
	private readonly cacheTTL = 5 * 60 * 1000; // 5 minut

	constructor(config?: OpenRouterConfig) {
		// Walidacja zmiennych środowiskowych
		const env = envSchema.safeParse({
			OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
			OPENROUTER_URL: process.env.OPENROUTER_URL,
			DEFAULT_MODEL: process.env.DEFAULT_MODEL,
			DEFAULT_PARAMS: process.env.DEFAULT_PARAMS,
		});

		if (!env.success) {
			throw new ValidationError(
				'Invalid environment configuration',
				500,
				{ code: 'ENV_VALIDATION_ERROR', message: env.error.message },
			);
		}

		// Inicjalizacja pól z konfiguracją lub wartościami domyślnymi
		this.apiKey = config?.apiKey ?? env.data.OPENROUTER_API_KEY;
		this.baseUrl = config?.baseUrl ?? env.data.OPENROUTER_URL;
		this.defaultModel =
			config?.defaultModel ?? env.data.DEFAULT_MODEL;
		this.defaultParams =
			config?.defaultParams ?? env.data.DEFAULT_PARAMS;
	}

	/**
	 * Sprawdza stan serwisu poprzez wykonanie prostego zapytania do API
	 */
	public async checkHealth(): Promise<{
		status: 'ok' | 'error';
		latency: number;
	}> {
		try {
			const startTime = Date.now();
			await this.sendRequest({
				messages: [],
				model: this.defaultModel,
			});
			const latency = Date.now() - startTime;

			return { status: 'ok', latency };
		} catch (error) {
			await this.logError('Health check failed', error as Error);
			return { status: 'error', latency: -1 };
		}
	}

	private async validateJsonResponse<T>(
		content: unknown,
		format: ResponseFormat,
	): Promise<T> {
		try {
			const parsedContent =
				typeof content === 'string' ? JSON.parse(content) : content;

			// Użyj predefiniowanego schematu dla fiszek
			if (format.json_schema.name === 'FlashcardsResponse') {
				return flashcardsResponseSchema.parse(parsedContent) as T;
			}

			// Dla innych schematów (gdyby były w przyszłości)
			const schema = z.object(
				format.json_schema.schema as z.ZodRawShape,
			);
			return schema.parse(parsedContent) as T;
		} catch (error) {
			throw new ValidationError('Response validation failed', 400, {
				code: 'VALIDATION_ERROR',
				message:
					error instanceof Error
						? error.message
						: 'Unknown validation error',
				data: { schema: format.json_schema.schema },
			});
		}
	}

	public async chatComplete<T>(options: ChatOptions): Promise<T> {
		// Sprawdzamy limit wywołań
		if (this.isRateLimited()) {
			const waitTime = this.getWaitTime();
			throw new ApiError('Rate limit exceeded', 429, {
				code: 'RATE_LIMIT',
				message: `Too many requests. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
				data: { waitTime },
			});
		}

		// Sprawdzamy cache
		const cacheKey = this.generateCacheKey(options);
		const cachedResult = this.getFromCache<T>(cacheKey);
		if (cachedResult) {
			await this.logMetrics('chatComplete (cached)', 0);
			return cachedResult;
		}

		// Walidacja parametrów wejściowych
		const validationResult = chatOptionsSchema.safeParse(options);
		if (!validationResult.success) {
			const error = new ValidationError('Invalid chat options', 400, {
				code: 'INVALID_OPTIONS',
				message: 'Chat options validation failed',
				data: this.maskSensitiveData(
					validationResult.error.errors,
				) as Record<string, unknown>,
			});
			await this.logError('chatComplete validation failed', error);
			throw error;
		}

		const payload = this.buildPayload(validationResult.data);
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < this.maxRetries; attempt++) {
			try {
				const startTime = Date.now();
				const response = await this.sendRequest<T>(payload);
				await this.logMetrics('chatComplete', startTime);

				if (!response.choices?.[0]?.message?.content) {
					throw new ValidationError(
						'Invalid API response format',
						400,
						{
							code: 'INVALID_RESPONSE',
							message: 'Response missing required fields',
						},
					);
				}

				const content = response.choices[0].message.content;

				// Walidacja odpowiedzi JSON Schema
				if (options.responseFormat?.type === 'json_schema') {
					const validatedContent = await this.validateJsonResponse<T>(
						content,
						options.responseFormat,
					);
					this.saveToCache(cacheKey, validatedContent);
					return validatedContent;
				}

				// Jeśli nie ma formatu JSON Schema, zwracamy surową odpowiedź
				this.saveToCache(cacheKey, content);
				return content as T;
			} catch (error) {
				lastError = error as Error;
				await this.logError(
					`Attempt ${attempt + 1} failed`,
					error as Error,
				);

				if (
					error instanceof ValidationError ||
					(error instanceof ApiError &&
						error.code !== 429 &&
						error.code < 500)
				) {
					throw error;
				}

				if (attempt < this.maxRetries - 1) {
					const delay = this.baseDelay * Math.pow(2, attempt);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
			}
		}

		const maxRetriesError =
			lastError ||
			new NetworkError('Max retries exceeded', 503, {
				code: 'MAX_RETRIES',
				message: 'Failed after maximum retry attempts',
			});
		await this.logError('Max retries exceeded', maxRetriesError);
		throw maxRetriesError;
	}

	private isRateLimited(): boolean {
		const now = Date.now();
		// Usuń stare timestampy (starsze niż minuta)
		this.requestTimestamps = this.requestTimestamps.filter(
			(timestamp) => now - timestamp < 60000,
		);

		return this.requestTimestamps.length >= this.maxRequestsPerMinute;
	}

	private getWaitTime(): number {
		if (this.requestTimestamps.length === 0) return 0;
		const now = Date.now();
		const oldestTimestamp = this.requestTimestamps[0];
		return Math.max(0, 60000 - (now - oldestTimestamp));
	}

	private generateCacheKey(options: ChatOptions): string {
		return JSON.stringify({
			systemMessage: options.systemMessage,
			userMessage: options.userMessage,
			modelName: options.modelName ?? this.defaultModel,
			modelParams: options.modelParams,
			responseFormat: options.responseFormat,
		});
	}

	private getFromCache<T>(key: string): T | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.cacheTTL) {
			this.cache.delete(key);
			return null;
		}

		return cached.data as T;
	}

	private saveToCache(key: string, data: unknown): void {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	private async sendRequest<T>(
		payload: Record<string, unknown>,
	): Promise<ApiResponse<T>> {
		// Dodaj request do licznika
		const now = Date.now();
		this.requestTimestamps.push(now);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				const apiError = new ApiError(
					error.message || 'API request failed',
					response.status,
					{ code: 'API_ERROR', message: error.message, data: error },
				);
				await this.logError('API request failed', apiError);
				throw apiError;
			}

			return await response.json();
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			const networkError = new NetworkError(
				'Failed to connect to OpenRouter API',
				503,
				{
					code: 'NETWORK_ERROR',
					message:
						error instanceof Error ? error.message : 'Unknown error',
				},
			);
			await this.logError('Network request failed', networkError);
			throw networkError;
		}
	}

	private buildPayload(
		options: ChatOptions,
	): Record<string, unknown> {
		return {
			messages: [
				{ role: 'system', content: options.systemMessage },
				{ role: 'user', content: options.userMessage },
			],
			model: options.modelName ?? this.defaultModel,
			...this.defaultParams,
			...options.modelParams,
			response_format: options.responseFormat,
		};
	}

	private maskSensitiveData(data: unknown): unknown {
		if (typeof data !== 'object' || data === null) {
			return data;
		}

		if (Array.isArray(data)) {
			return data.map((item) => this.maskSensitiveData(item));
		}

		const maskedData = Object.entries(
			data as Record<string, unknown>,
		).reduce(
			(acc, [key, value]) => {
				if (this.sensitiveKeys.includes(key)) {
					acc[key] = '***MASKED***';
				} else if (typeof value === 'object' && value !== null) {
					acc[key] = this.maskSensitiveData(value);
				} else {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, unknown>,
		);

		return maskedData;
	}

	private async logError(
		message: string,
		error: ExtendedError,
	): Promise<void> {
		console.error({
			timestamp: new Date().toISOString(),
			level: 'error',
			message,
			error: {
				name: error.name,
				message: error.message,
				code: error.code,
				details: this.maskSensitiveData(error.details),
			},
		});
	}

	private async logMetrics(
		operation: string,
		startTime: number,
	): Promise<void> {
		const duration = Date.now() - startTime;
		// W produkcji należy użyć odpowiedniego systemu metryk
		console.info({
			timestamp: new Date().toISOString(),
			level: 'info',
			operation,
			duration,
			model: this.defaultModel,
		});
	}

	// Dodanie metody pomocniczej do generowania fiszek
	async generateFlashcards(
		sourceText: string,
		model?: string,
	): Promise<{
		flashcards: GenerationCandidateDto[];
		duration: number;
	}> {
		const startTime = Date.now();
		const response = await this.chatComplete<{
			flashcards: GenerationCandidateDto[];
		}>({
			systemMessage: SYSTEM_PROMPTS.FLASHCARDS_GENERATOR,
			userMessage: sourceText,
			modelName: model,
			responseFormat: RESPONSE_FORMATS.FLASHCARDS,
			modelParams: this.defaultParams,
		});

		const duration = Date.now() - startTime;
		await this.logMetrics('generateFlashcards', startTime);

		return {
			flashcards: response.flashcards,
			duration,
		};
	}
}
