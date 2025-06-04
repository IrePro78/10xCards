'use client';

import { Loader2 } from 'lucide-react';

export function SkeletonLoader() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-8">
			<Loader2 className="h-8 w-8 animate-spin text-[#FF385C] dark:text-[#FF385C]" />
			<p className="text-muted-foreground text-sm">
				Trwa generowanie fiszek...
			</p>
		</div>
	);
}
