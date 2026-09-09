import React from 'react';
import { Check } from 'lucide-react';
import { useUserInteractions } from '@/hooks/useUserInteractions';

interface Props {
  articleId: number;
  className?: string;
}

export default function ReadBadge({ articleId, className = '' }: Props) {
  const { isRead } = useUserInteractions();

  if (!isRead(articleId)) return null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] tracking-tight border border-emerald-200/60 shadow-2xs ${className}`}
      title="You have read this article"
    >
      <Check size={11} className="stroke-[2.5]" />
      <span>Read</span>
    </span>
  );
}
