'use client';

import { motion } from 'framer-motion';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  unreadCount: number;
}

export function ScrollToBottomButton({ onClick, unreadCount }: ScrollToBottomButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={onClick}
      className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 active:bg-gray-100 dark:bg-black/80 dark:hover:bg-black/90 dark:border dark:border-white/10 dark:backdrop-blur-xl"
      aria-label="Scroll to bottom"
    >
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A84FF] px-1 text-[11px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      <svg
        className="h-5 w-5 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
      </svg>
    </motion.button>
  );
}
