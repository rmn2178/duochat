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
      <div className="border-t border-wa-divider px-3 py-1.5 dark:border-transparent">
        <button
          onClick={onFetch}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-wa-teal shadow-sm transition-colors hover:bg-white active:bg-gray-100 dark:bg-wa-bubble-other-dark/80 dark:text-wa-green dark:hover:bg-wa-bubble-other-dark"
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
          className="overflow-hidden border-t border-wa-divider dark:border-transparent"
        >
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 scrollbar-hide">
            {loading ? (
              <div className="flex items-center gap-2 text-[12px] text-wa-tick-grey">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-wa-teal/20 border-t-wa-teal" />
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
                    className="shrink-0 rounded-full border border-wa-teal/20 bg-white px-3 py-1.5 text-[13px] text-gray-800 shadow-sm transition-colors hover:bg-wa-teal/5 active:bg-wa-teal/10 dark:border-wa-green/20 dark:bg-wa-bubble-other-dark dark:text-wa-text-primary-dark dark:hover:bg-wa-green/5"
                  >
                    {suggestion}
                  </motion.button>
                ))}
                <button
                  onClick={onDismiss}
                  className="shrink-0 text-[12px] text-wa-tick-grey hover:text-gray-600"
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
