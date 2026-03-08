"use client";

import { useState, useTransition } from "react";
import { useSession } from "@/lib/auth-client";
import {
  toggleReaction,
  REACTION_TYPES,
  REACTION_LABELS,
  REACTION_EMOJIS,
  type ReactionType,
  type ReactionCounts,
} from "@/lib/actions/reactions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ArticleReactionsProps {
  articleId: string;
  initialCounts: ReactionCounts;
  initialUserReaction: ReactionType | null;
}

export function ArticleReactions({
  articleId,
  initialCounts,
  initialUserReaction,
}: ArticleReactionsProps) {
  const { data: session } = useSession();
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    initialUserReaction,
  );
  const [isPending, startTransition] = useTransition();

  const isLoggedIn = Boolean(session?.user);

  function handleReact(type: ReactionType) {
    if (!isLoggedIn) {
      toast.info("Sign in to react to this article.");
      return;
    }

    startTransition(async () => {
      try {
        const prev = userReaction;
        const { userReaction: nextReaction } = await toggleReaction(
          articleId,
          type,
        );

        // Update counts optimistically (already happened on server, now sync UI)
        setCounts((c) => {
          const next = { ...c };

          // Remove old reaction from counts
          if (prev && prev in next) {
            next[prev] = Math.max(0, next[prev] - 1);
          }

          // Add new reaction to counts
          if (nextReaction && nextReaction in next) {
            next[nextReaction] = next[nextReaction] + 1;
          }

          next.total =
            next.like + next.insightful + next.inspiring + next.curious;

          return next;
        });

        setUserReaction(nextReaction);
      } catch {
        toast.error("Could not save your reaction. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-[var(--pub-text-muted)]">
        {isLoggedIn ? "How did this article make you feel?" : (
          <span>
            <a
              href="/login"
              className="underline underline-offset-2 hover:text-[var(--pub-text-secondary)] transition-colors"
            >
              Sign in
            </a>{" "}
            to react to this article
          </span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {REACTION_TYPES.map((type) => {
          const isActive = userReaction === type;
          const count = counts[type];

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleReact(type)}
              disabled={isPending}
              aria-label={`${REACTION_LABELS[type]}${count > 0 ? ` (${count})` : ""}`}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pub-accent)] focus-visible:ring-offset-1",
                isActive
                  ? "border-[var(--pub-accent)] bg-[var(--pub-brand-bg)] text-[var(--pub-brand-fg)] shadow-sm"
                  : "border-[var(--pub-border)] bg-[var(--pub-surface)] text-[var(--pub-text-secondary)] hover:border-[var(--pub-accent)]/50 hover:bg-[var(--pub-tag-bg)]",
                isPending && "cursor-wait opacity-70",
                !isLoggedIn && "cursor-pointer",
              )}
            >
              <span aria-hidden="true">{REACTION_EMOJIS[type]}</span>
              <span>{REACTION_LABELS[type]}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 tabular-nums",
                    isActive
                      ? "text-[var(--pub-brand-fg)]"
                      : "text-[var(--pub-text-muted)]",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
