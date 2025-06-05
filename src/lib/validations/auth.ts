import * as z from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Adres email jest wymagany')
		.email('Nieprawidłowy format adresu email'),
	password: z.string().min(1, 'Hasło jest wymagane'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
