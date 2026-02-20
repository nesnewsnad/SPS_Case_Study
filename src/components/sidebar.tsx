'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  AlertTriangle,
  Cpu,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

function SidebarContent({
  collapsed,
  setCollapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo / Header */}
      <div className="border-b px-3 py-4">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3 px-3')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold tracking-tight">SPS Health</h1>
              <p className="text-muted-foreground text-[11px] tracking-wide">Claims Analytics</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground hidden shrink-0 rounded-md p-1.5 transition-colors md:inline-flex"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Entity Selector — hidden when collapsed */}
      {!collapsed && (
        <div className="border-b px-4 py-3">
          <div className="border-border/50 rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100/50 px-3 py-2.5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Active Entity
            </p>
            <p className="text-sm font-bold tracking-tight">Pharmacy A</p>
            <p className="text-muted-foreground text-[11px]">2021 Claims Data</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1 py-4', collapsed ? 'px-2' : 'px-3')}>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center text-sm transition-all duration-200',
                collapsed
                  ? 'justify-center rounded-lg p-2.5'
                  : 'items-start gap-3 rounded-lg px-3 py-2.5',
                isActive
                  ? 'bg-teal-50/80 text-teal-900 shadow-sm ring-1 ring-teal-200/50'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  !collapsed && 'mt-0.5',
                  isActive ? 'text-teal-600' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="leading-tight font-medium">{item.name}</p>
                  <p
                    className={cn(
                      'mt-0.5 text-xs leading-tight',
                      isActive ? 'text-teal-600/70' : 'text-muted-foreground',
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t px-4 py-3">
          <p className="text-muted-foreground text-xs">Built with Claude Code</p>
          <p className="text-muted-foreground text-xs">AI Implementation Case Study</p>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed top-3 left-3 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white/90 shadow-sm backdrop-blur"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-slate-50/80">
              <SidebarContent
                collapsed={false}
                setCollapsed={() => {}}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden flex-col border-r transition-all duration-300 md:flex',
          'bg-gradient-to-b from-white via-white to-slate-50/80',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} />
      </aside>
    </>
  );
}
