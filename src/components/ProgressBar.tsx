'use client';

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
	const [shouldRender, setShouldRender] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const [smoothProgress, setSmoothProgress] = useState(0);
	const animationFrameRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(0);

	// Reset progress when visibility changes
	useEffect(() => {
		if (isVisible) {
			setSmoothProgress(0); // Reset to 0 when starting
			setShouldRender(true);
			setIsExiting(false);
		} else {
			setIsExiting(true);
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [isVisible]);

	// Reset lastTimeRef when progress changes to 0
	useEffect(() => {
		if (progress === 0) {
			lastTimeRef.current = 0;
		}
	}, [progress]);

	// Płynna animacja paska postępu
	useEffect(() => {
		const animate = (timestamp: number) => {
			if (!lastTimeRef.current) lastTimeRef.current = timestamp;
			const deltaTime = timestamp - lastTimeRef.current;

			setSmoothProgress((prev) => {
				const diff = progress - prev;
				// Używamy deltaTime do obliczenia kroku animacji
				// Im mniejszy mnożnik (0.004), tym wolniejsza i płynniejsza animacja
				const step = Math.min(
					Math.abs(diff),
					Math.abs(diff * deltaTime * 0.004),
				);

				if (Math.abs(diff) < 0.01) return progress;
				return prev + (diff > 0 ? step : -step);
			});

			lastTimeRef.current = timestamp;
			animationFrameRef.current = requestAnimationFrame(animate);
		};

		animationFrameRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [progress]);

	if (!shouldRender) return null;

	const containerClasses = `
		mb-4 
		animate-${isExiting ? 'fadeOut' : 'fadeIn'}
		transition-all 
		duration-500 
		ease-in-out
	`.trim();

	return (
		<>
			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes fadeOut {
					from {
						opacity: 1;
						transform: translateY(0);
					}
					to {
						opacity: 0;
						transform: translateY(-10px);
					}
				}

				.animate-fadeIn {
					animation: fadeIn 500ms ease-in-out forwards;
				}

				.animate-fadeOut {
					animation: fadeOut 500ms ease-in-out forwards;
				}
			`}</style>
			<div className={containerClasses}>
				<div className="h-4 w-full overflow-hidden rounded-full border border-gray-200 bg-gray-100">
					<div
						className="h-full bg-blue-400 transition-transform duration-100 ease-linear"
						style={{
							width: '100%',
							transform: `translateX(${smoothProgress - 100}%)`,
						}}
					/>
				</div>
				<p className="mt-1 text-center text-xs text-gray-500">
					Generowanie fiszek: {currentFlashcard} z {totalFlashcards} (
					{Math.round(smoothProgress)}%)
				</p>
			</div>
		</>
	);
}
