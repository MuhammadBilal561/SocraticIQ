import { NavLink, useLocation } from "react-router-dom";
import { useSession } from "../store/SessionContext";
import { useAuth } from "../store/AuthContext";
import { Brain, BarChart3, History, Terminal, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/practice", label: "Problem", icon: Brain },
  { to: "/dashboard", label: "Mastery", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useSession();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const email = user?.email ?? "unknown";
  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Scanline CRT effect */}
      <div className="scanline" aria-hidden="true" />

      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Hacker sidebar */}
      <nav
        className="flex flex-col w-14 md:w-56 shrink-0 border-r border-neon-green/15 bg-surface/40 backdrop-blur-sm"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-12 flex items-center justify-center md:justify-start md:pl-5 border-b border-neon-green/10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-neon-green text-black flex items-center justify-center shadow-[0_0_8px_rgba(0,255,65,0.3)]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline font-heading font-bold text-sm tracking-tight text-neon-green/90">
              socratiq
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex flex-col gap-0.5 p-2 md:p-3 mt-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-2.5 md:px-3 py-2 rounded-lg text-sm font-code transition-all duration-150 ${
                  isActive
                    ? "bg-neon-green/10 text-neon-green font-medium shadow-[0_0_8px_rgba(0,255,65,0.1)]"
                    : "text-foreground/40 hover:text-neon-green/70 hover:bg-neon-green/5"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-base w-5 h-5 text-center shrink-0 flex items-center justify-center" aria-hidden="true">
                  <item.icon className={`w-4 h-4 ${isActive ? "text-neon-green" : ""}`} />
                </span>
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Active session indicator */}
        {state.currentSession && (
          <div className="p-2 md:p-3 border-t border-neon-green/10">
            <div className="hidden md:block px-2.5 py-1.5 rounded-md bg-neon-green/5 border border-neon-green/15">
              <p className="text-[10px] text-neon-green/50 uppercase tracking-wider mb-0.5 font-code font-medium">
                $ active
              </p>
              <p className="text-xs text-foreground/60 truncate font-code">
                {state.currentSession.problemTitle.slice(0, 28)}
              </p>
            </div>
            <div className="md:hidden flex justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" aria-label="Active session" />
            </div>
          </div>
        )}

        {/* User section at bottom */}
        <div className="border-t border-neon-green/10 p-2 md:p-3 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-2.5 px-2 md:px-2.5 py-1.5">
            <div className="w-6 h-6 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold font-code text-neon-cyan">
                {initials}
              </span>
            </div>
            <span className="hidden md:block text-[11px] font-code text-foreground/50 truncate max-w-[120px]">
              {user?.email?.split("@")[0] ?? "guest"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-2.5 md:px-3 py-1.5 rounded-lg text-sm font-code text-foreground/30 hover:text-destructive/80 hover:bg-destructive/10 transition-all duration-150 cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">$ logout</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}