'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { LoginResponse } from '@/types';

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), code }),
      });

      const data: LoginResponse = await res.json();

      if (data.success) {
        router.push('/chat');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Network error. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl border border-white/40 dark:bg-black/40 dark:border-white/10"
    >
      <div className="space-y-4">
        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60"
          >
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 99999 99999"
            required
            autoComplete="tel"
            className="w-full rounded-xl border border-white/30 bg-white/50 px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-black/40 focus:border-ios-blue focus:bg-white/70 dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-ios-blue dark:focus:bg-black/70"
          />
        </div>

        {/* Secret Code */}
        <div>
          <label
            htmlFor="code"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60"
          >
            Secret Code
          </label>
          <input
            id="code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/30 bg-white/50 px-4 py-3 font-mono text-[15px] tracking-[0.3em] outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-black/40 focus:border-ios-blue focus:bg-white/70 dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-ios-blue dark:focus:bg-black/70"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !phone || !code}
          className="w-full rounded-xl bg-ios-blue py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-ios-blue-active active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
    </motion.form>
  );
}
