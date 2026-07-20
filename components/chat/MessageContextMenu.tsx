import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface Action {
  label: string;
  icon: string;
  danger?: boolean;
  onClick: () => void;
}

interface MessageContextMenuProps {
  message: Message;
  x: number;
  y: number;
  onClose: () => void;
  actions: Action[];
}

export function MessageContextMenu({
  message,
  x,
  y,
  onClose,
  actions,
}: MessageContextMenuProps) {
  // Adjust position to stay on screen
  const adjustedX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 190 : x);
  const adjustedY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - (actions.length * 44 + 20) : y);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 min-w-[180px] overflow-hidden rounded-2xl bg-white/70 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl border border-white/40 dark:bg-black/70 dark:border-white/10"
        style={{
          left: adjustedX,
          top: adjustedY,
          transformOrigin: 'top left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-medium transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/20",
              action.danger ? "text-red-500" : "text-black/80 dark:text-white/90"
            )}
          >
            <span className="text-base">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
