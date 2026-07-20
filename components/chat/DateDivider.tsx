'use client';

import { formatDateDivider } from '@/lib/utils';

interface DateDividerProps {
  date: string;
}

export function DateDivider({ date }: DateDividerProps) {
  const label = formatDateDivider(date);

  return (
    <div className="my-4 flex justify-center">
      <span className="rounded-2xl bg-black/10 px-4 py-1 text-[11px] font-semibold tracking-wide text-black/60 shadow-sm backdrop-blur-xl border border-white/20 dark:bg-white/10 dark:text-white/80 dark:border-white/10">
        {label}
      </span>
    </div>
  );
}
