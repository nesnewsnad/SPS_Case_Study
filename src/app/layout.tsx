import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/sidebar';
import { ChatSidebar } from '@/components/chat-sidebar';
import { FilterProvider } from '@/contexts/filter-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SPS Health — Pharmacy A Claims Analysis',
  description:
    'Interactive claims analytics dashboard for SPS Health RFP evaluation — Pharmacy A 2021 utilization data',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <Suspense>
              <FilterProvider>
                <main className="bg-muted/30 flex-1 overflow-y-auto">{children}</main>
                <ChatSidebar />
              </FilterProvider>
            </Suspense>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
