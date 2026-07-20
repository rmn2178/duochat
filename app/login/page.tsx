import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Duo Chat',
  description: 'Sign in to your Duo Chat account',
};

export default function LoginPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Duo Chat';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center ios-glass-bg px-4">
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[22px] bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 dark:bg-black/20 dark:border-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-white"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">{appName}</h1>
          <p className="mt-1 text-sm text-white/70">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <LoginForm />
      </div>
    </div>
  );
}
