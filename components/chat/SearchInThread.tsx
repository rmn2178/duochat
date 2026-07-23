'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInThreadProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function SearchInThread({ isOpen, onClose, onSearch }: SearchInThreadProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-white dark:bg-black/90"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={handleClear}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search in chat..."
              className="flex-1 rounded-lg bg-black/5 px-3 py-2 text-[14px] outline-none dark:bg-white/10 dark:text-white/90"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
