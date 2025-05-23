'use client';

import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useRef } from 'react';

interface ProgressBarProps {
	progress: number;
	currentFlashcard: number;
	totalFlashcards: number;
	isVisible: boolean;
}

export function ProgressBar({
	progress,
	currentFlashcard,
	totalFlashcards,
	isVisible,
}: ProgressBarProps) {
	const [smoothProgress, setSmoothProgress] = useState(0);
	const [opacity, setOpacity] = useState(1);
	const [shouldRender, setShouldRender] = useState(false);
	const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Inicjalizacja i czyszczenie
	useEffect(() => {
		// Inicjalizacja przy pierwszym renderowaniu
		if (isVisible) {
			setShouldRender(true);
		}

		// Czyszczenie przy odmontowaniu
		return () => {
			if (fadeIntervalRef.current) {
				clearInterval(fadeIntervalRef.current);
			}
		};
	}, [isVisible]);

	// Obsługa widoczności i animacji zanikania
	useEffect(() => {
		// Pokaż pasek
		if (isVisible && !shouldRender) {
			setShouldRender(true);
			setOpacity(1);
		}

		// Zatrzymaj animację zanikania, jeśli pasek ma być widoczny
		if (isVisible && fadeIntervalRef.current) {
			clearInterval(fadeIntervalRef.current);
			fadeIntervalRef.current = null;
			setOpacity(1);
		}

		// Rozpocznij animację zanikania
		if (!isVisible && shouldRender && !fadeIntervalRef.current) {
			// Stopniowo zmniejszamy przezroczystość
			fadeIntervalRef.current = setInterval(() => {
				setOpacity((prevOpacity) => {
					const newOpacity = Math.max(0, prevOpacity - 0.025);

					if (newOpacity <= 0) {
						if (fadeIntervalRef.current) {
							clearInterval(fadeIntervalRef.current);
							fadeIntervalRef.current = null;
						}
						setShouldRender(false);
					}
					return newOpacity;
				});
			}, 50);
		}

		return () => {
			if (!isVisible && fadeIntervalRef.current) {
				clearInterval(fadeIntervalRef.current);
			}
		};
	}, [isVisible, shouldRender]);

	// Płynna animacja paska postępu
	useEffect(() => {
		if (!shouldRender) return;

		// Aktualizuj wartość smoothProgress z opóźnieniem dla płynnego efektu
		const timer = setTimeout(() => {
			setSmoothProgress(progress);
		}, 50);

		return () => clearTimeout(timer);
	}, [progress, shouldRender]);

	// Resetuj progress tylko gdy pasek jest całkowicie ukryty
	useEffect(() => {
		if (!shouldRender) {
			setSmoothProgress(0);
		}
	}, [shouldRender]);

	if (!shouldRender) {
		return null;
	}

	return (
		<div
			className="space-y-2 transition-opacity duration-300"
			style={{ opacity }}
		>
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Generowanie fiszek
				</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{currentFlashcard} z {totalFlashcards} (
					{Math.round(smoothProgress)}%)
				</p>
			</div>
			<Progress
				value={smoothProgress}
				className="h-2 w-full border border-gray-300 bg-transparent dark:border-gray-600"
			/>
		</div>
	);
}
