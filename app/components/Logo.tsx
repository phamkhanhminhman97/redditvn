interface LogoProps {
	className?: string;
}

/** Brand mark: rounded badge with an upward arrow, a quiet nod to the upvote. */
export function LogoMark({ className }: LogoProps) {
	return (
		<svg
			viewBox="0 0 32 32"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<rect width="32" height="32" rx="9" className="fill-accent-600" />
			<path d="M16 8.5 L22.5 17.5 H18 V24 H14 V17.5 H9.5 Z" fill="white" />
		</svg>
	);
}

export function Logo({ className }: LogoProps) {
	return (
		<span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
			<LogoMark className="h-8 w-8 shrink-0" />
			<span className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
				Reddit<span className="text-accent-600">VN</span>
			</span>
		</span>
	);
}
