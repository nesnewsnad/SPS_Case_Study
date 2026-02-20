import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/sidebar';
import { ChatSidebar } from '@/components/chat-sidebar';
import { FilterProvider } from '@/contexts/filter-context';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SPS Health — Pharmacy A Claims Analysis',
  description:
    'Interactive claims analytics dashboard for SPS Health RFP evaluation — Pharmacy A 2021 utilization data',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'SPS Health — Pharmacy A Claims Analysis',
    description:
      'Interactive claims analytics dashboard analyzing 596K pharmacy claims across 5 states, 189 groups, and 5,640 drugs.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <Suspense>
              <FilterProvider>
                <main className="dashboard-bg flex-1 overflow-y-auto pt-14 md:pt-0">
                  {children}
                </main>
                <ChatSidebar />
              </FilterProvider>
            </Suspense>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
