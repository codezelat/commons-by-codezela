// Shared reaction types and constants — kept separate from
// "use server" actions so they can be imported on both client and server.

export type ReactionType = "like" | "insightful" | "inspiring" | "curious";

export const REACTION_TYPES: ReactionType[] = [
  "like",
  "insightful",
  "inspiring",
  "curious",
];

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: "Like",
  insightful: "Insightful",
  inspiring: "Inspiring",
  curious: "Curious",
};

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  insightful: "💡",
  inspiring: "❤️",
  curious: "🤔",
};

export interface ReactionCounts {
  like: number;
  insightful: number;
  inspiring: number;
  curious: number;
  total: number;
}

export interface ArticleReactionsData {
  counts: ReactionCounts;
  userReaction: ReactionType | null;
}
