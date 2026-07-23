'use client';

export function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[13px] text-black/60 dark:text-white/60">
      typing
      <span className="ml-0.5 flex gap-[2px]">
        <span className="typing-dot inline-block h-[5px] w-[5px] rounded-full bg-black/40 dark:bg-white/60" />
        <span className="typing-dot inline-block h-[5px] w-[5px] rounded-full bg-black/40 dark:bg-white/60" />
        <span className="typing-dot inline-block h-[5px] w-[5px] rounded-full bg-black/40 dark:bg-white/60" />
      </span>
    </span>
  );
}
