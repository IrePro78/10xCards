// Typy dla parametrów modelu
export type ModelParameters = {
	temperature?: number;
	max_tokens?: number;
	top_p?: number;
	frequency_penalty?: number;
	presence_penalty?: number;
};

// Typy dla konfiguracji
export interface OpenRouterConfig {
	apiKey?: string;
	baseUrl?: string;
	defaultModel?: string;
	defaultParams?: ModelParameters;
}

// Typ dla formatu odpowiedzi JSON Schema
export interface ResponseFormat {
	type: 'json_schema';
	json_schema: {
		name: string;
		strict: boolean;
		schema: Record<string, unknown>;
	};
}

// Typy dla opcji czatu
export interface ChatOptions {
	systemMessage: string;
	userMessage: string;
	modelName?: string;
	modelParams?: ModelParameters;
	responseFormat?: ResponseFormat;
}

// Typy dla błędów
export type ErrorDetails = {
	code: string;
	message: string;
	data?: Record<string, unknown>;
};

// Typy dla odpowiedzi API
export type ApiResponse<T> = {
	choices: Array<{
		message: {
			content: T;
		};
	}>;
};
