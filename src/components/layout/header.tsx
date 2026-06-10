"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mockLogout } from "@/lib/mock-auth";
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
  ChevronDown,
  AlertTriangle,
  Wrench,
  UserCheck,
  Package,
  ClipboardCheck,
  CheckCheck,
} from "lucide-react";
import { cn, getRoleColor } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getTimeAgo,
  Notification,
} from "@/lib/notifications";

interface HeaderProps {
  user: {
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  AlertTriangle: <AlertTriangle className="h-4 w-4 text-[#EF4444]" />,
  Wrench: <Wrench className="h-4 w-4 text-[#D4AF37]" />,
  UserCheck: <UserCheck className="h-4 w-4 text-[#22C55E]" />,
  Package: <Package className="h-4 w-4 text-[#3B82F6]" />,
  ClipboardCheck: <ClipboardCheck className="h-4 w-4 text-[#A855F7]" />,
};

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getNotifications().slice(0, 10));
    setUnreadCount(getUnreadCount());
  }, []);

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

  const handleMarkAllRead = () => {
    const updated = markAllAsRead();
    setNotifications(updated.slice(0, 10));
    setUnreadCount(0);
  };

  const handleNotificationClick = (id: string) => {
    const updated = markAsRead(id);
    setNotifications(updated.slice(0, 10));
    setUnreadCount(getUnreadCount());
  };

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    mockLogout();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const roleBadgeColor = getRoleColor(user.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#222222] bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 px-4 lg:px-6">
      <div className="flex-1" />

      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#7A7A7A] hover:text-white hover:bg-white/5 relative"
          onClick={() => setOpen(!open)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#222222] bg-[#161616] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222]">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#F5D76E] transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
            </div>
            <ScrollArea className="max-h-96">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#7A7A7A]">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-white/5 transition-colors border-b border-[#222222]/50 last:border-0",
                      !n.read && "bg-[#D4AF37]/5"
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {iconMap[n.icon] || <Bell className="h-4 w-4 text-[#7A7A7A]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm", n.read ? "text-[#B8B8B8]" : "text-white font-medium")}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#7A7A7A] whitespace-nowrap">
                          {getTimeAgo(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7A7A] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 flex items-start pt-1">
                        <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-[#D4AF37]/10 text-[#D4AF37]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-sm">
              <span className="font-medium text-white">{user.full_name}</span>
              <span className={cn("text-xs capitalize", roleBadgeColor)}>
                {user.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-[#7A7A7A] hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-[#222222] bg-[#161616]">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-white">{user.full_name}</span>
              <span className="text-xs text-[#7A7A7A] font-normal">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#222222]" />
          <DropdownMenuItem onClick={() => router.push(`/${user.role}`)} className="text-[#B8B8B8] focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/${user.role}/settings`)} className="text-[#B8B8B8] focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#222222]" />
          <DropdownMenuItem onClick={handleSignOut} className="text-[#EF4444] focus:text-[#EF4444] focus:bg-[#EF4444]/10">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
