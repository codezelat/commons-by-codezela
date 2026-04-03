"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sendVerificationEmail, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getRoleLabel, isAdminRole, isStaffRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CommonsLogo } from "@/components/ui/commons-logo";
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
  BadgeCheck,
  MailWarning,
  Loader2,
  RefreshCw,
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
      emailVerified?: boolean | null;
    };
  };
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isResendingVerification, startResendVerification] = useTransition();
  const [isRefreshingStatus, startRefreshStatus] = useTransition();
  const isAdmin = isAdminRole(session.user.role);
  const isStaff = isStaffRole(session.user.role);
  const isEmailVerified = session.user.emailVerified === true;
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

  function handleResendVerificationEmail() {
    startResendVerification(async () => {
      try {
        const callbackURL =
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : "/dashboard";
        const result = await sendVerificationEmail({
          email: session.user.email,
          callbackURL,
        });
        if (result.error) {
          toast.error(result.error.message || "Failed to send verification email");
          return;
        }
        toast.success("Verification email sent. Check your inbox.");
      } catch {
        toast.error("Failed to send verification email");
      }
    });
  }

  function handleRefreshVerificationStatus() {
    startRefreshStatus(async () => {
      router.refresh();
    });
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
          <CommonsLogo size="sm" />
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
                  <div
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      isEmailVerified
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                    )}
                  >
                    {isEmailVerified ? (
                      <BadgeCheck className="h-2.5 w-2.5" />
                    ) : (
                      <MailWarning className="h-2.5 w-2.5" />
                    )}
                    {isEmailVerified ? "Email verified" : "Email not verified"}
                  </div>
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
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  isEmailVerified
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                )}
              >
                {isEmailVerified ? (
                  <BadgeCheck className="h-2.5 w-2.5" />
                ) : (
                  <MailWarning className="h-2.5 w-2.5" />
                )}
                {isEmailVerified ? "Email verified" : "Email not verified"}
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
            <CommonsLogo size="sm" />
            <span className="text-sm font-semibold text-foreground">
              Commons
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {!isEmailVerified && (
              <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-red-950 shadow-sm dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-100">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-2.5">
                    <MailWarning className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Email verification required</p>
                      <p className="text-sm text-red-900/80 dark:text-red-100/85">
                        Verify your email to secure your account. Until then, this warning stays visible.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="border border-red-200 bg-white text-red-700 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-900/50"
                      onClick={handleResendVerificationEmail}
                      disabled={isResendingVerification}
                    >
                      {isResendingVerification ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Resend verification
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-800 hover:bg-red-100 hover:text-red-900 dark:text-red-100 dark:hover:bg-red-900/50 dark:hover:text-red-100"
                      onClick={handleRefreshVerificationStatus}
                      disabled={isRefreshingStatus}
                    >
                      {isRefreshingStatus ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      )}
                      Refresh status
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
