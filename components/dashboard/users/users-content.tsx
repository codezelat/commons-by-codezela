"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getUsers,
  sendUserPasswordReset,
  setUserBanState,
  updateUserRole,
  type ManagedUser,
  type UserListResult,
} from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Search, UserCog } from "lucide-react";
import type { AppRole } from "@/lib/roles";

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "reader", label: "Reader" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

function roleLabel(role: AppRole) {
  return ROLE_OPTIONS.find((item) => item.value === role)?.label || "Reader";
}

export function UsersContent() {
  const [data, setData] = useState<UserListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [page, setPage] = useState(1);

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<ManagedUser | null>(null);
  const [banReason, setBanReason] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers({
        search: search || undefined,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize: 20,
      });
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function updateRole(user: ManagedUser, nextRole: AppRole) {
    if (user.role === nextRole) {
      return;
    }
    startTransition(async () => {
      try {
        await updateUserRole(user.id, nextRole);
        toast.success(`${user.name} is now ${roleLabel(nextRole)}`);
        await loadUsers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update role");
      }
    });
  }

  function openBanDialog(user: ManagedUser) {
    setBanTarget(user);
    setBanReason(user.banReason || "");
    setBanDialogOpen(true);
  }

  function runBan() {
    if (!banTarget) {
      return;
    }
    startTransition(async () => {
      try {
        await setUserBanState(banTarget.id, true, banReason);
        toast.success(`${banTarget.name} was suspended`);
        setBanDialogOpen(false);
        setBanTarget(null);
        setBanReason("");
        await loadUsers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to suspend user");
      }
    });
  }

  function toggleBan(user: ManagedUser) {
    if (user.banned) {
      startTransition(async () => {
        try {
          await setUserBanState(user.id, false);
          toast.success(`${user.name} was reactivated`);
          await loadUsers();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to reactivate user");
        }
      });
      return;
    }

    openBanDialog(user);
  }

  function sendResetLink(user: ManagedUser) {
    startTransition(async () => {
      try {
        await sendUserPasswordReset(user.id);
        toast.success(`Password reset link sent to ${user.email}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to send password reset link",
        );
      }
    });
  }

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage readers, moderators, and admins.
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {data?.total ?? 0} user{data?.total === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </form>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value as typeof roleFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as typeof statusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => void loadUsers()} variant="outline" disabled={isPending}>
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[230px]">User</TableHead>
              <TableHead className="min-w-[170px]">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-center">Published</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-[64px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.published_count > 0 && (
                        <Link
                          href={`/authors/${user.id}`}
                          target="_blank"
                          className="inline-flex text-xs text-emerald-700 hover:text-emerald-800"
                        >
                          View public profile
                        </Link>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateRole(user, value as AppRole)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                        Suspended
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    <span className="text-sm text-muted-foreground">{user.published_count}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => sendResetLink(user)}>
                          Send password reset
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleBan(user)}>
                          {user.banned ? "Reactivate user" : "Suspend user"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1 || isPending}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              disabled={data.page >= data.totalPages || isPending}
              onClick={() =>
                setPage((value) => Math.min(data.totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend user</DialogTitle>
            <DialogDescription>
              Suspend {banTarget?.name} from signing in until you reactivate their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason (optional)</Label>
            <Textarea
              id="ban-reason"
              value={banReason}
              onChange={(event) => setBanReason(event.target.value)}
              rows={4}
              placeholder="Explain why this account is being suspended."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={runBan}
              disabled={isPending || !banTarget}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
