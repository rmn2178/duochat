import { motion } from 'framer-motion';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  currentReaction?: string;
  x: number;
  y: number;
}

export function ReactionPicker({ onSelect, onClose, currentReaction, x, y }: ReactionPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="fixed z-50 rounded-full"
        style={{
          left: Math.max(10, Math.min(x - 100, typeof window !== 'undefined' ? window.innerWidth - 220 : 0)),
          top: Math.max(20, y - 60)
        }}
      >
        <div className="flex gap-1 rounded-full bg-white/80 px-3 py-2 shadow-xl backdrop-blur-xl border border-white/40 dark:bg-black/80 dark:border-white/10">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(emoji);
                onClose();
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 ${
                currentReaction === emoji ? 'bg-black/10 ring-2 ring-black/20 dark:bg-white/20 dark:ring-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
