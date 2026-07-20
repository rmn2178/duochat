'use client';

import { useState, useCallback } from 'react';
import type { AISuggestion } from '@/types';

interface UseAIRepliesReturn {
  suggestions: string[];
  loading: boolean;
  error: string | null;
  fetchSuggestions: () => Promise<void>;
  clearSuggestions: () => void;
}

export function useAIReplies(): UseAIRepliesReturn {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/suggest', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to fetch suggestions');

      const data: AISuggestion = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('AI suggestions error:', err);
      setError('Failed to generate suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, fetchSuggestions, clearSuggestions };
}
