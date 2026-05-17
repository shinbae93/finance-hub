import { useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SideNav } from './side-nav';

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const sidebarWidth = collapsed ? 72 : 220;

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav collapsed={collapsed} />
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{ left: sidebarWidth - 12 }}
        className="absolute top-[26px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
