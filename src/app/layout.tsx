import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LoadingBar } from '@/components/LoadingBar';

export const metadata: Metadata = {
  title: 'DevOps Hub',
  description: 'Secure and seamless authentication.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
       <body className="h-full">
        <ThemeProvider>
            <LoadingBar />
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
