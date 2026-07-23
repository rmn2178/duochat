'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AIReplyBarProps {
  suggestions: string[];
  loading: boolean;
  onFetch: () => void;
  onSelect: (suggestion: string) => void;
  onDismiss: () => void;
}

export function AIReplyBar({
  suggestions,
  loading,
  onFetch,
  onSelect,
  onDismiss,
}: AIReplyBarProps) {
  if (suggestions.length === 0 && !loading) {
    return (
      <div className="border-t border-black/10 px-3 py-1.5 dark:border-white/10">
        <button
          onClick={onFetch}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-[#0A84FF] shadow-sm transition-colors hover:bg-white active:bg-gray-100 dark:bg-white/10 dark:text-[#0A84FF] dark:hover:bg-white/20"
        >
          <span>✨</span>
          Suggest replies
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {(suggestions.length > 0 || loading) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-black/10 dark:border-white/10"
        >
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 scrollbar-hide">
            {loading ? (
              <div className="flex items-center gap-2 text-[12px] text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A84FF]/20 border-t-[#0A84FF]" />
                Thinking...
              </div>
            ) : (
              <>
                {suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelect(suggestion)}
                    className="shrink-0 rounded-full border border-[#0A84FF]/20 bg-white px-3 py-1.5 text-[13px] text-gray-800 shadow-sm transition-colors hover:bg-[#0A84FF]/5 active:bg-[#0A84FF]/10 dark:border-[#0A84FF]/20 dark:bg-black/40 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    {suggestion}
                  </motion.button>
                ))}
                <button
                  onClick={onDismiss}
                  className="shrink-0 text-[12px] text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
