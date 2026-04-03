"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { toggleReaction } from "@/lib/actions/reactions";
import {
  REACTION_TYPES,
  REACTION_LABELS,
  REACTION_EMOJIS,
  type ReactionType,
  type ReactionCounts,
} from "@/lib/actions/reaction-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";
import { useReactionSound } from "@/lib/use-reaction-sound";

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
  // Track which button just "popped" so we can re-trigger the CSS animation
  const [poppedType, setPoppedType] = useState<ReactionType | null>(null);
  const popTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const { trigger: haptic } = useWebHaptics();
  const { play: playSound } = useReactionSound();
  const isLoggedIn = Boolean(session?.user);

  const triggerPop = useCallback((type: ReactionType) => {
    setPoppedType(null);
    // Force a re-render cycle so the animation class is removed then re-added
    requestAnimationFrame(() => {
      setPoppedType(type);
      clearTimeout(popTimeout.current);
      popTimeout.current = setTimeout(() => setPoppedType(null), 400);
    });
  }, []);

  const handleReact = useCallback(
    (type: ReactionType) => {
      if (!isLoggedIn) {
        haptic("warning");
        toast.info("Sign in to react to this article.", {
          action: {
            label: "Sign in",
            onClick: () => {
              window.location.href = "/login";
            },
          },
        });
        return;
      }

      // Optimistic update
      const prevReaction = userReaction;
      const prevCounts = counts;

      const nextReaction = prevReaction === type ? null : type;
      setCounts((c) => {
        const next = { ...c };
        if (prevReaction && prevReaction in next) {
          next[prevReaction] = Math.max(0, next[prevReaction] - 1);
        }
        if (nextReaction && nextReaction in next) {
          next[nextReaction] = next[nextReaction] + 1;
        }
        next.total =
          next.like + next.insightful + next.inspiring + next.curious;
        return next;
      });
      setUserReaction(nextReaction);

      // Visual pop on the emoji
      triggerPop(type);

      // Haptic feedback (vibrates on mobile) + audio feedback (all platforms)
      if (nextReaction) {
        haptic("success");
        playSound(type);
      } else {
        haptic("selection");
        playSound("remove");
      }

      startTransition(async () => {
        try {
          const { userReaction: serverReaction } = await toggleReaction(
            articleId,
            type,
          );
          setUserReaction(serverReaction);
        } catch {
          setCounts(prevCounts);
          setUserReaction(prevReaction);
          haptic("error");
          toast.error("Could not save your reaction. Please try again.");
        }
      });
    },
    [
      userReaction,
      counts,
      haptic,
      playSound,
      articleId,
      triggerPop,
      isLoggedIn,
    ],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Scoped keyframes for the pop animation */}
      <style>{`
        @keyframes reaction-pop {
          0% { transform: scale(1); }
          30% { transform: scale(1.35); }
          50% { transform: scale(0.9); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes reaction-ring {
          0% { box-shadow: 0 0 0 0 var(--pub-accent, #7c3aed); }
          50% { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .reaction-emoji-pop {
          animation: reaction-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .reaction-btn-ring {
          animation: reaction-ring 0.45s ease-out;
        }
      `}</style>

      <p className="text-xs font-medium text-[var(--pub-text-muted)]">
        {isLoggedIn ? (
          "How did this article make you feel?"
        ) : (
          <span>
            <a
              href="/login"
              className="underline underline-offset-2 transition-colors hover:text-[var(--pub-text-secondary)]"
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
          const isPopping = poppedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleReact(type)}
              disabled={isPending && !isActive}
              aria-label={`${REACTION_LABELS[type]}${count > 0 ? ` (${count})` : ""}`}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pub-accent)] focus-visible:ring-offset-1",
                isActive
                  ? "border-[var(--pub-accent)] bg-[var(--pub-brand-bg)] text-[var(--pub-brand-fg)] shadow-sm"
                  : "border-[var(--pub-border)] bg-[var(--pub-surface)] text-[var(--pub-text-secondary)] hover:border-[var(--pub-accent)]/50 hover:bg-[var(--pub-tag-bg)]",
                isPending && !isActive && "cursor-wait opacity-60",
                isPopping && "reaction-btn-ring",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block transition-transform duration-150",
                  isActive && "scale-110",
                  isPopping && "reaction-emoji-pop",
                )}
              >
                {REACTION_EMOJIS[type]}
              </span>
              <span>{REACTION_LABELS[type]}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 tabular-nums transition-all duration-150",
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
