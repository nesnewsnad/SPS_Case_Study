import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Claims Explorer' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
