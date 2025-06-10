import fs from 'fs';
import path from 'path';

export function logToFile(message: string) {
	const logPath = path.join(process.cwd(), 'callback.log');
	fs.appendFileSync(
		logPath,
		`${new Date().toISOString()} - ${message}\n`,
	);
}
