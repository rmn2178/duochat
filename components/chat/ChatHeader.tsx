'use client';

import { usePresence } from '@/hooks/usePresence';
import { useTypingStatus } from '@/hooks/useTypingStatus';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/lib/utils';
import { TypingIndicator } from './TypingIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  partnerName: string;
  onSearchToggle: () => void;
}

export function ChatHeader({ partnerName, onSearchToggle }: ChatHeaderProps) {
  const { isPartnerOnline, partnerLastSeen } = usePresence();
  const { isPartnerTyping } = useTypingStatus();
  const { logout } = useAuth();

  const getStatusText = () => {
    if (isPartnerTyping) return <TypingIndicator />;
    if (isPartnerOnline) return <span className="text-[13px] font-medium text-ios-blue">online</span>;
    if (partnerLastSeen) {
      return (
        <span className="text-[13px] text-black/60 dark:text-white/60">
          last seen {formatRelativeTime(partnerLastSeen)}
        </span>
      );
    }
    return <span className="text-[13px] text-black/60 dark:text-white/60">offline</span>;
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/70 px-3 py-2.5 backdrop-blur-xl border-b border-black/5 dark:bg-black/70 dark:border-white/10">
      {/* Partner Avatar */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ios-light-gray text-lg font-semibold text-black/70 dark:bg-ios-dark-gray dark:text-white/90">
        {partnerName.charAt(0).toUpperCase()}
        {isPartnerOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-ios-green dark:border-black" />
        )}
      </div>

      {/* Name + Status */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold text-black dark:text-white">
          {partnerName}
        </h1>
        <div className="h-[18px]">{getStatusText()}</div>
      </div>

      {/* Actions */}
      <button
        onClick={onSearchToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ios-blue transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/20"
        aria-label="Search"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-10 w-10 items-center justify-center rounded-full text-ios-blue transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/20"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          <DropdownMenuItem onClick={toggleDarkMode}>
            Toggle dark mode
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="text-red-500">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
