"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/api/notifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  ChevronDown,
  AlertTriangle,
  Wrench,
  UserCheck,
  Package,
  ClipboardCheck,
  CheckCheck,
  Sun,
  Moon,
  Droplets,
} from "lucide-react";
import { cn, getRoleColor } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import type { UserRole } from "@/types";
import type { Notification } from "@/lib/api/notifications";
import Clock from "@/components/Clock";

interface HeaderProps {
  user: {
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
  };
  onMenuToggle?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  AlertTriangle: <AlertTriangle className="h-4 w-4 text-destructive" />,
  Wrench: <Wrench className="h-4 w-4 text-primary" />,
  UserCheck: <UserCheck className="h-4 w-4 text-success" />,
  Package: <Package className="h-4 w-4 text-info" />,
  ClipboardCheck: <ClipboardCheck className="h-4 w-4 text-accent-foreground" />,
};

export const Header = memo(function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const notifs = await getNotifications(user.email);
        setNotifications(notifs.slice(0, 10));
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch {
        // silently fail
      }
    }
    load();
  }, [user.email]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user.email);
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      await markAsRead(id);
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
    } catch {
      // silently fail
    }
  };

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const cycleTheme = () => {
    const order: Array<"dark" | "light" | "ocean"> = ["dark", "light", "ocean"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const themeIcon = { dark: <Moon className="h-4 w-4" />, light: <Sun className="h-4 w-4" />, ocean: <Droplets className="h-4 w-4" /> }[theme];

  const roleBadgeColor = getRoleColor(user.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-header-bg/95 backdrop-blur supports-[backdrop-filter]:bg-header-bg/60 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-text-tertiary hover:text-foreground hover:bg-accent lg:hidden shrink-0"
        onClick={onMenuToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <Clock />
      <div className="flex-1" />

      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-text-tertiary hover:text-foreground hover:bg-accent relative"
          onClick={() => setOpen(!open)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
            </div>
            <ScrollArea className="max-h-96">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {iconMap[n.icon] || <Bell className="h-4 w-4 text-text-tertiary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm", n.read ? "text-text-secondary" : "text-foreground font-medium")}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                          {getTimeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 flex items-start pt-1">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-text-tertiary hover:text-foreground hover:bg-accent"
        onClick={cycleTheme}
        title={`Theme: ${theme}`}
      >
        {themeIcon}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-sm">
              <span className="font-medium text-foreground">{user.full_name}</span>
              <span className={cn("text-xs capitalize", roleBadgeColor)}>
                {user.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-text-tertiary hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-border bg-card">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-foreground">{user.full_name}</span>
              <span className="text-xs text-text-tertiary font-normal">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={() => router.push(`/${user.role}`)} className="text-text-secondary focus:text-primary focus:bg-primary/10">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/${user.role}/settings`)} className="text-text-secondary focus:text-primary focus:bg-primary/10">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
