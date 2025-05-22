'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonLoader() {
	return (
		<div className="space-y-6">
			{Array.from({ length: 3 }).map((_, index) => (
				<div
					key={index}
					className="border-border bg-card text-card-foreground mb-4 overflow-hidden rounded-md border"
				>
					<div className="flex flex-col">
						<div className="border-border border-b p-4">
							<Skeleton className="mb-2 h-4 w-[250px]" />
							<Skeleton className="h-12 w-full" />
						</div>
						<div className="border-border border-b p-4">
							<Skeleton className="mb-2 h-4 w-[250px]" />
							<Skeleton className="h-20 w-full" />
						</div>
					</div>
					<div className="bg-muted flex justify-end gap-2 p-3">
						<Skeleton className="h-9 w-20" />
						<Skeleton className="h-9 w-20" />
						<Skeleton className="h-9 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}
