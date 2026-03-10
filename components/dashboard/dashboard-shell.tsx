"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getRoleLabel, isAdminRole, isStaffRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  FileText,
  ShieldCheck,
  FolderOpen,
  Tags,
  Star,
  Menu,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Users,
  Shield,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const baseNavItems: NavItem[] = [
  { title: "Articles", href: "/dashboard/articles", icon: FileText },
];

const adminNavItems: NavItem[] = [
  { title: "Moderation", href: "/dashboard/moderation", icon: ShieldCheck },
  { title: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { title: "Tags", href: "/dashboard/tags", icon: Tags },
  { title: "Featured", href: "/dashboard/featured", icon: Star },
];

const adminOnlyNavItems: NavItem[] = [
  { title: "Users", href: "/dashboard/users", icon: Users },
  { title: "Audit", href: "/dashboard/audit", icon: Shield },
];

interface DashboardShellProps {
  children: React.ReactNode;
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role?: string | null;
    };
  };
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = isAdminRole(session.user.role);
  const isStaff = isStaffRole(session.user.role);
  const navItems = isStaff
    ? [
        ...baseNavItems,
        ...adminNavItems,
        ...(isAdmin ? adminOnlyNavItems : []),
      ]
    : baseNavItems;
  const roleLabel = getRoleLabel(session.user.role);

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-foreground">
            <span className="font-display italic text-xs font-semibold text-background">
              C
            </span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground">
              Commons
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle (desktop) */}
      <div className="hidden border-t px-3 py-2 lg:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!collapsed && (
            <span className="text-xs text-slate-500">Collapse</span>
          )}
        </Button>
      </div>

      {/* User Section */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent border-0 bg-transparent cursor-pointer",
              collapsed && "justify-center",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-slate-200 text-xs font-medium text-slate-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {session.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground/80">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {roleLabel}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden flex-shrink-0 border-r bg-background transition-all duration-200 lg:block",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center border-b bg-background px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md border-0 bg-transparent cursor-pointer mr-3 hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <span className="font-display italic text-xs font-semibold text-background">
                C
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              Commons
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
