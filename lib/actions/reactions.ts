"use server";

import { query, queryOne, execute } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type {
  ReactionType,
  ReactionCounts,
  ArticleReactionsData,
} from "./reaction-types";
import { REACTION_TYPES } from "./reaction-types";

// ---------- Helpers ----------

async function getOptionalSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch {
    return null;
  }
}

// ---------- Public Actions ----------

/**
 * Get reaction counts for an article. Does not require authentication.
 */
export async function getArticleReactionCounts(
  articleId: string,
): Promise<ReactionCounts> {
  const rows = await query<{ reaction_type: string; count: string }>(
    `SELECT reaction_type, COUNT(*) as count
     FROM article_reaction
     WHERE article_id = $1
     GROUP BY reaction_type`,
    [articleId],
  );

  const counts: ReactionCounts = {
    like: 0,
    insightful: 0,
    inspiring: 0,
    curious: 0,
    total: 0,
  };

  for (const row of rows) {
    const type = row.reaction_type as ReactionType;
    if (type in counts) {
      counts[type] = parseInt(row.count, 10);
    }
  }

  counts.total =
    counts.like + counts.insightful + counts.inspiring + counts.curious;

  return counts;
}

/**
 * Get the current user's reaction for an article.
 * Returns null if the user is not logged in or hasn't reacted.
 */
export async function getUserReactionForArticle(
  articleId: string,
): Promise<ReactionType | null> {
  const session = await getOptionalSession();
  if (!session) return null;

  const row = await queryOne<{ reaction_type: string }>(
    `SELECT reaction_type FROM article_reaction WHERE article_id = $1 AND user_id = $2`,
    [articleId, session.user.id],
  );

  return (row?.reaction_type as ReactionType) ?? null;
}

/**
 * Get full reactions data (counts + current user's reaction) for an article.
 */
export async function getArticleReactions(
  articleId: string,
): Promise<ArticleReactionsData> {
  const [counts, userReaction] = await Promise.all([
    getArticleReactionCounts(articleId),
    getUserReactionForArticle(articleId),
  ]);

  return { counts, userReaction };
}

/**
 * Toggle a reaction for the current user on an article.
 * - If the user hasn't reacted yet, adds the reaction.
 * - If the user already has the same reaction, removes it.
 * - If the user has a different reaction, switches to the new one.
 * Requires authentication.
 */
export async function toggleReaction(
  articleId: string,
  reactionType: ReactionType,
): Promise<{ success: boolean; userReaction: ReactionType | null }> {
  const session = await getOptionalSession();
  if (!session) {
    throw new Error("You must be signed in to react to articles.");
  }

  if (!REACTION_TYPES.includes(reactionType)) {
    throw new Error("Invalid reaction type.");
  }

  const article = await queryOne<{ id: string }>(
    `SELECT id FROM article WHERE id = $1 AND status = 'published'`,
    [articleId],
  );
  if (!article) {
    throw new Error("Reactions are only available on published articles.");
  }

  const existing = await queryOne<{ reaction_type: string }>(
    `SELECT reaction_type FROM article_reaction WHERE article_id = $1 AND user_id = $2`,
    [articleId, session.user.id],
  );

  let userReaction: ReactionType | null;

  if (!existing) {
    // No reaction yet — insert new
    await execute(
      `INSERT INTO article_reaction (id, article_id, user_id, reaction_type)
       VALUES (gen_random_uuid()::text, $1, $2, $3)`,
      [articleId, session.user.id, reactionType],
    );
    userReaction = reactionType;
  } else if (existing.reaction_type === reactionType) {
    // Same reaction — remove it (toggle off)
    await execute(
      `DELETE FROM article_reaction WHERE article_id = $1 AND user_id = $2`,
      [articleId, session.user.id],
    );
    userReaction = null;
  } else {
    // Different reaction — update it
    await execute(
      `UPDATE article_reaction SET reaction_type = $3
       WHERE article_id = $1 AND user_id = $2`,
      [articleId, session.user.id, reactionType],
    );
    userReaction = reactionType;
  }

  revalidatePath(`/articles/`);

  return { success: true, userReaction };
}

// ---------- Admin Actions ----------

/**
 * Get reaction summary for multiple articles (used in admin list).
 */
export async function getReactionSummaryForArticles(
  articleIds: string[],
): Promise<Record<string, ReactionCounts>> {
  if (articleIds.length === 0) return {};

  const rows = await query<{
    article_id: string;
    reaction_type: string;
    count: string;
  }>(
    `SELECT article_id, reaction_type, COUNT(*) as count
     FROM article_reaction
     WHERE article_id = ANY($1::text[])
     GROUP BY article_id, reaction_type`,
    [articleIds],
  );

  const result: Record<string, ReactionCounts> = {};

  for (const id of articleIds) {
    result[id] = { like: 0, insightful: 0, inspiring: 0, curious: 0, total: 0 };
  }

  for (const row of rows) {
    const counts = result[row.article_id];
    if (counts) {
      const type = row.reaction_type as ReactionType;
      if (type in counts) {
        counts[type] = parseInt(row.count, 10);
      }
    }
  }

  for (const id of articleIds) {
    const c = result[id];
    c.total = c.like + c.insightful + c.inspiring + c.curious;
  }

  return result;
}
