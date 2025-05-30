'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ActiveLinkProps {
	href: string;
	children: React.ReactNode;
}

export function ActiveLink({ href, children }: ActiveLinkProps) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link
			href={href}
			className={cn(
				'relative px-4 py-2 text-[15px] font-medium transition-all duration-200',
				'hover:text-[#FF385C]',
				'after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full after:rounded-full',
				'after:transition-all after:duration-200',
				isActive
					? 'text-[#FF385C] after:bg-[#FF385C]'
					: 'text-[#717171] after:bg-transparent hover:after:bg-[#FF385C]',
			)}
		>
			{children}
		</Link>
	);
}
