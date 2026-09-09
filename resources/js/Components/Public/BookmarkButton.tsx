import React from 'react';
import { Bookmark } from 'lucide-react';
import { useUserInteractions } from '@/hooks/useUserInteractions';

interface Props {
  articleId: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({
  articleId,
  size = 16,
  className = '',
  showText = false,
}: Props) {
  const { isFavorited, toggleFavorite } = useUserInteractions();
  const favorited = isFavorited(articleId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(articleId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favorites' : 'Save for later'}
      title={favorited ? 'Saved in favorites' : 'Save for later'}
      className={`group/bookmark relative inline-flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer ${className}`}
    >
      <Bookmark
        size={size}
        className={`transition-colors ${
          favorited
            ? 'fill-red-600 text-red-600'
            : 'text-slate-400 group-hover/bookmark:text-red-500'
        }`}
      />
      {showText && (
        <span className={`text-xs font-semibold ${favorited ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {favorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
