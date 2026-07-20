import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Duo Chat',
  description: 'A private, two-person chat with AI reply suggestions',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Duo Chat',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh overflow-hidden ios-glass-bg">
        {children}
      </body>
    </html>
  );
}
