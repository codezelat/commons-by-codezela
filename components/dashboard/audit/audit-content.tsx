"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAuditLogEntries, type AuditLogListResult } from "@/lib/actions/audit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search } from "lucide-react";

const ACTION_FILTERS = [
  { value: "all", label: "All actions" },
  { value: "user.role.updated", label: "Role updates" },
  { value: "user.suspended", label: "Suspensions" },
  { value: "user.reactivated", label: "Reactivations" },
  { value: "user.password_reset.sent", label: "Password reset sends" },
  { value: "article.moderated", label: "Article moderation" },
  { value: "tag.moderated", label: "Tag moderation" },
];

const TARGET_FILTERS = [
  { value: "all", label: "All targets" },
  { value: "user", label: "Users" },
  { value: "article", label: "Articles" },
  { value: "tag", label: "Tags" },
];

export function AuditContent() {
  const [data, setData] = useState<AuditLogListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogEntries({
        search: search || undefined,
        action: actionFilter,
        targetType: targetFilter,
        page,
        pageSize: 25,
      });
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, page, search, targetFilter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Trail</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable record of moderator and admin operations.
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {data?.total ?? 0} event{data?.total === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by actor, action, or target"
            className="pl-9"
          />
        </form>
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={targetFilter}
          onValueChange={(value) => {
            setTargetFilter(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[190px]">When</TableHead>
              <TableHead className="min-w-[220px]">Actor</TableHead>
              <TableHead className="min-w-[220px]">Action</TableHead>
              <TableHead className="min-w-[220px]">Target</TableHead>
              <TableHead className="hidden lg:table-cell">Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                  Loading audit trail...
                </TableCell>
              </TableRow>
            ) : data?.items.length ? (
              data.items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {entry.actor_name || "Unknown actor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.actor_email || "No email"} · {entry.actor_role}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {entry.target_label || entry.target_id || "Unknown target"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.target_type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[360px] lg:table-cell">
                    <code className="line-clamp-2 text-xs text-muted-foreground">
                      {JSON.stringify(entry.metadata || {})}
                    </code>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                  No audit records found.
                </TableCell>
              </TableRow>
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
              disabled={data.page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() =>
                setPage((value) => Math.min(data.totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
