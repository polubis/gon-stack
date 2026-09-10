import { cn } from '@repo/react-kit/cn';
import type { Category } from '@/modules/shared/data';
import { CategoryIcon } from './icon';

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

export const CategoryTag = ({ category }: { category: Category }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    style={{ backgroundColor: `${category.color}1a`, color: category.color }}
  >
    <CategoryIcon id={category.icon} className="h-3 w-3" />
    {category.name}
  </span>
);
