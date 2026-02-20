'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, AlertTriangle, Cpu, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Executive Overview',
    href: '/',
    icon: LayoutDashboard,
    description: 'KPIs, trends, and utilization summary',
  },
  {
    name: 'Claims Explorer',
    href: '/explorer',
    icon: Search,
    description: 'Filter and drill into claims data',
  },
  {
    name: 'Anomalies & Insights',
    href: '/anomalies',
    icon: AlertTriangle,
    description: 'Deep-dives and recommendations',
  },
  {
    name: 'AI Process',
    href: '/process',
    icon: Cpu,
    description: 'Methodology and documentation',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card flex w-64 flex-col border-r">
      {/* Logo / Header */}
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Building2 className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">SPS Health</h1>
            <p className="text-muted-foreground text-xs">Claims Analytics</p>
          </div>
        </div>
      </div>

      {/* Entity Selector */}
      <div className="border-b px-4 py-3">
        <div className="bg-muted/50 rounded-md px-3 py-2">
          <p className="text-muted-foreground text-xs font-medium">Active Entity</p>
          <p className="text-sm font-semibold">Pharmacy A</p>
          <p className="text-muted-foreground text-xs">2021 Claims Data</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <div>
                <p className="leading-tight font-medium">{item.name}</p>
                <p
                  className={cn(
                    'mt-0.5 text-xs leading-tight',
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <p className="text-muted-foreground text-xs">Built with Claude Code</p>
        <p className="text-muted-foreground text-xs">AI Implementation Case Study</p>
      </div>
    </aside>
  );
}
