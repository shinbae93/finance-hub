import { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, LayoutDashboard, LogOut, Moon, Sun, TrendingUp } from 'lucide-react';
import { useAuthStore, useLogout } from '../features/auth';
import { useTheme } from '../lib/theme';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks', Icon: TrendingUp },
];

interface SideNavProps {
  collapsed: boolean;
}

export function SideNav({ collapsed }: SideNavProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();
  const { theme, toggleTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarInitial = user?.fullName?.charAt(0).toUpperCase() ?? '?';
  const displayName = user?.fullName ?? user?.email ?? '';

  return (
    <aside
      className={`sticky top-0 flex flex-shrink-0 self-stretch flex-col border-r border-border bg-card transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      }`}
    >
      {/* Header: wordmark */}
      <div className="flex h-16 items-center border-b border-border px-4">
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
              className={`flex rounded-md text-sm transition-colors ${
                collapsed ? 'flex-col items-center gap-1 px-2 py-3' : 'items-center gap-3 px-3 py-2'
              } ${
                active
                  ? 'bg-[#fcd535] font-semibold text-[#181a20]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
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

      {/* Bottom: user profile button + popover */}
      <div className="border-t border-border p-2" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className={`flex w-full items-center rounded-md px-2 py-2 transition-colors hover:bg-muted ${
            collapsed ? 'justify-center' : 'gap-2'
          }`}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-[#181a20]">
            {avatarInitial}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronUp
                size={14}
                className={`flex-shrink-0 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {profileOpen && (
          <div className="absolute bottom-[60px] left-2 right-2 z-50 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <div className="flex items-center gap-3 border-b border-border px-3 py-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-sm font-bold text-[#181a20]">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                toggleTheme();
                setProfileOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-muted-foreground" />
              ) : (
                <Moon size={15} className="text-muted-foreground" />
              )}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <button
              disabled={isPending}
              onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
              className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <LogOut size={15} className="text-muted-foreground" />
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
