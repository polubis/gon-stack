import { cn } from '@repo/react-kit/cn';
import { CategoryIcon, type CategoryIconId } from './icon';

/** Structural shape any module's category model satisfies. */
type Category = { name: string; icon: CategoryIconId; color: string };

export const CategoryAvatar = ({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) => (
  <span
    className={cn(
      'grid h-9 w-9 shrink-0 place-items-center rounded-full',
      className,
    )}
    style={{ backgroundColor: `${category.color}1a`, color: category.color }}
  >
    <CategoryIcon id={category.icon} className="h-4.5 w-4.5" />
  </span>
);
