'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface PresenceState {
  isPartnerOnline: boolean;
  partnerLastSeen: string | null;
}

export function usePresence(): PresenceState {
  const { supabase, currentUser, partnerUser } = useAuthContext();
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<string | null>(null);

  const handleVisibilityChange = useCallback(() => {
    // Will re-track on visibility change
  }, []);

  useEffect(() => {
    const channel = supabase.channel('presence:duo', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerPresence = state[partnerUser.id];
        if (partnerPresence && partnerPresence.length > 0) {
          setIsPartnerOnline(true);
        } else {
          setIsPartnerOnline(false);
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === partnerUser.id) {
          setIsPartnerOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (key === partnerUser.id) {
          setIsPartnerOnline(false);
          // Set last seen from the most recent presence state
          if (leftPresences?.[0]?.online_at) {
            setPartnerLastSeen(leftPresences[0].online_at as string);
          } else {
            setPartnerLastSeen(new Date().toISOString());
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Handle visibility changes
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        channel.track({
          user_id: currentUser.id,
          online_at: new Date().toISOString(),
        });
      } else {
        channel.untrack();
      }
      handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUser.id, partnerUser.id, handleVisibilityChange]);

  return { isPartnerOnline, partnerLastSeen };
}
