import { Link } from "react-router";
import { categoryBadgeClass, categoryLabel } from "~/lib/categories";

interface CategoryBadgeProps {
	slug: string;
	/** Render as a link to the category page (default) or plain span. */
	linked?: boolean;
}

export function CategoryBadge({ slug, linked = true }: CategoryBadgeProps) {
	const classes = `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${categoryBadgeClass(slug)} transition-colors`;
	const label = categoryLabel(slug);

	if (!linked) return <span className={classes}>{label}</span>;
	return (
		<Link to={`/c/${slug}`} className={`${classes} hover:brightness-95`}>
			{label}
		</Link>
	);
}
