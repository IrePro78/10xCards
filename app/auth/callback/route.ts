import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Funkcja do zapisu logów do pliku
function logToFile(message: string) {
	const logPath = path.join(process.cwd(), 'callback.log');
	fs.appendFileSync(
		logPath,
		`${new Date().toISOString()} - ${message}\n`,
	);
}

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const searchParams = requestUrl.searchParams;
	const type = searchParams.get('type');
	const next = searchParams.get('next');

	logToFile(`\n=== CALLBACK HANDLER CALLED ===`);
	logToFile(`URL: ${request.url}`);
	logToFile(
		`Search Params: ${JSON.stringify(Object.fromEntries(searchParams))}`,
	);
	logToFile(`Type: ${type}`);
	logToFile(`Next: ${next}`);

	// Jeśli mamy parametr next, przekieruj tam
	if (next) {
		const redirectUrl = new URL(next, request.url);
		logToFile(`Redirecting to next: ${redirectUrl.toString()}`);
		return NextResponse.redirect(redirectUrl);
	}

	// Domyślnie przekieruj na stronę główną
	const redirectUrl = new URL('/generate', request.url);
	logToFile(`Redirecting to default: ${redirectUrl.toString()}`);
	return NextResponse.redirect(redirectUrl);
}
