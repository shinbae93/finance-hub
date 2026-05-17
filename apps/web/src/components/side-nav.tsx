import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore, useLogout } from '../features/auth';
import { useTheme } from '../lib/theme';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks', Icon: TrendingUp },
];

export function SideNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  const avatarInitial = user?.fullName?.charAt(0).toUpperCase() ?? '?';

  return (
    <aside
      className={`flex h-screen flex-col border-r border-[#2b3139] bg-[#1e2329] transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      } sticky top-0 flex-shrink-0`}
    >
      {/* Wordmark / Monogram */}
      <div className="flex h-16 items-center border-b border-[#2b3139] px-4">
        {collapsed ? (
          <span className="text-sm font-bold text-[#fcd535]">FH</span>
        ) : (
          <Link to="/dashboard" className="text-base font-bold text-[#fcd535]">
            FinanceHub
          </Link>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_LINKS.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-[#fcd535] font-semibold text-[#181a20]'
                  : 'text-[#707a8a] hover:bg-[#2b3139] hover:text-[#eaecef]'
              } ${collapsed ? 'flex-col gap-1 px-2 py-3' : ''}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {collapsed ? (
                <span className="text-[10px] leading-none">{label}</span>
              ) : (
                <span>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + controls */}
      <div className="flex flex-col gap-2 border-t border-[#2b3139] p-3">
        {/* User info (expanded only) */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-[#181a20]">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#eaecef]">{user.fullName}</p>
              <p className="truncate text-[10px] text-[#707a8a]">{user.email}</p>
            </div>
          </div>
        )}

        {/* Avatar only (collapsed) */}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-[#181a20]">
              {avatarInitial}
            </div>
          </div>
        )}

        {/* Controls row */}
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Sign out */}
          <button
            disabled={isPending}
            onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
            aria-label="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef] disabled:opacity-50"
          >
            <LogOut size={15} />
          </button>

          {/* Collapse toggle (only in expanded row) */}
          {!collapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {/* Expand button (collapsed state only) */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center self-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
