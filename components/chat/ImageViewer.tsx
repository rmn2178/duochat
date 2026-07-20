'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ src, isOpen, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  const handleDoubleClick = () => {
    setScale((prev) => (prev === 1 ? 2 : 1));
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = 'image';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: src });
      } catch {
        // User cancelled
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-black"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="text-white/80 transition-colors hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div
            className="flex flex-1 items-center justify-center overflow-hidden"
            onDoubleClick={handleDoubleClick}
          >
            <motion.img
              src={src}
              alt=""
              animate={{ scale }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-8 p-4">
            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="text-[11px]">Save</span>
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                <span className="text-[11px]">Share</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
