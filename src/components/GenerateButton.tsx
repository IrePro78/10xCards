'use client';

interface GenerateButtonProps {
	onClick: () => void;
	isLoading: boolean;
	isDisabled: boolean;
}

export function GenerateButton({
	onClick,
	isLoading,
	isDisabled,
}: GenerateButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={isLoading || isDisabled}
			className="inline-flex transform items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-75 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0.5 active:scale-95 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
			type="button"
		>
			{isLoading ? (
				<>
					<svg
						className="h-5 w-5 animate-spin text-blue-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span className="text-gray-600">Generowanie...</span>
				</>
			) : (
				<>
					<span className="text-blue-400">+</span>
					<span>Generuj fiszki</span>
				</>
			)}
		</button>
	);
}
