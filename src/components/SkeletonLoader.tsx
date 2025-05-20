'use client';

export function SkeletonLoader() {
	return (
		<div className="space-y-6">
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className="flashcard-item">
					<div className="flashcard-content">
						<div>
							<div className="bg-muted-foreground/20 mb-2 h-4 w-[250px] animate-pulse rounded"></div>
							<div className="flashcard-front bg-muted/80 h-12 animate-pulse"></div>
						</div>
						<div>
							<div className="bg-muted-foreground/20 mb-2 h-4 w-[250px] animate-pulse rounded"></div>
							<div className="flashcard-back bg-muted/80 h-20 animate-pulse"></div>
						</div>
					</div>
					<div className="flashcard-actions">
						<div className="bg-muted-foreground/20 h-9 w-20 animate-pulse rounded"></div>
						<div className="bg-muted-foreground/20 h-9 w-20 animate-pulse rounded"></div>
						<div className="bg-muted-foreground/20 h-9 w-20 animate-pulse rounded"></div>
					</div>
				</div>
			))}
		</div>
	);
}
