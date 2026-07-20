'use client';

import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AttachMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: () => void;
}

export function AttachMenu({ isOpen, onClose, onImageSelect }: AttachMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-left">Share</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-4 py-6">
          <button
            onClick={() => {
              onImageSelect();
              onClose();
            }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-600 dark:text-wa-text-secondary">Photo</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 opacity-40"
            disabled
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-400">Document</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 opacity-40"
            disabled
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <span className="text-[12px] text-gray-400">Camera</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
