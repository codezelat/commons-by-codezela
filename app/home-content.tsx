"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  MultiplePages,
  OpenBook,
  ShieldCheck,
  Spark,
} from "iconoir-react";
import { ManagedImage } from "@/components/ui/managed-image";
import type { Article } from "@/lib/actions/articles";
import type { HomePageStats } from "@/lib/actions/home";
import {
  deriveArticleSummary,
  formatArticleDate,
  getArticleReadingTimeMinutes,
} from "@/lib/article-metadata";
import { cn } from "@/lib/utils";
import { usePubTheme } from "@/components/site/pub-theme-provider";

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  article_count: number;
}

interface HomeTag {
  id: string;
  name: string;
  slug: string;
  article_count: number;
}

export interface HomeContentData {
  featured: Article[];
  recent: Article[];
  categories: HomeCategory[];
  tags: HomeTag[];
  stats: HomePageStats;
}

interface HomeContentProps {
  data: HomeContentData;
}

interface ThemeConfig {
  kicker: string;
  title: string;
  accent: string;
  body: string;
  palette: CSSProperties;
  frameClass: string;
  cardClass: string;
  softCardClass: string;
  accentChipClass: string;
  mutedClass: string;
  buttonClass: string;
  secondaryButtonClass: string;
}

const HOME_THEMES: Record<"cream" | "lavender", ThemeConfig> = {
  cream: {
    kicker: "Technical writing with restraint",
    title: "A sharper home for engineering ideas that deserve shelf life.",
    accent: "deserve shelf life",
    body: "Minimal copy. Strong hierarchy. A product surface that feels considered.",
    palette: {
      "--home-bg": "#ece7df",
      "--home-bg-2": "#f7f2eb",
      "--home-surface": "rgba(255,255,255,0.72)",
      "--home-surface-2": "rgba(255,255,255,0.92)",
      "--home-border": "rgba(72,57,43,0.12)",
      "--home-accent": "#8a6330",
      "--home-accent-2": "#c89a5b",
      "--home-text": "#16120f",
      "--home-muted": "rgba(22,18,15,0.66)",
      "--home-mesh":
        "radial-gradient(circle at 12% 15%, rgba(200,154,91,0.25), transparent 28%), radial-gradient(circle at 86% 18%, rgba(141,123,102,0.2), transparent 32%), linear-gradient(145deg, #ece7df 0%, #f7f2eb 54%, #e4ddd2 100%)",
    } as CSSProperties,
    frameClass:
      "border-black/8 bg-[var(--home-surface)] shadow-[0_34px_90px_rgba(88,66,37,0.14)] backdrop-blur-xl",
    cardClass: "border-black/8 bg-white/66",
    softCardClass: "border-[#c89a5b]/18 bg-[#c89a5b]/10",
    accentChipClass: "border-[#b07d3c]/25 bg-[#f5e8d3] text-[#7b5524]",
    mutedClass: "text-[var(--home-muted)]",
    buttonClass: "bg-[#1e1915] text-[#f8f1e8] hover:bg-black",
    secondaryButtonClass:
      "border-black/10 bg-white/70 text-[#1d1814] hover:bg-white",
  },
  lavender: {
    kicker: "Technical writing with standards",
    title: "A stronger surface for engineering work that should stay readable.",
    accent: "should stay readable",
    body: "Same structure, tuned to the alternate public theme without losing clarity or restraint.",
    palette: {
      "--home-bg": "#f1eef7",
      "--home-bg-2": "#faf8ff",
      "--home-surface": "rgba(255,255,255,0.72)",
      "--home-surface-2": "rgba(255,255,255,0.9)",
      "--home-border": "rgba(72,52,106,0.12)",
      "--home-accent": "#6a4fb0",
      "--home-accent-2": "#8e71d4",
      "--home-text": "#181421",
      "--home-muted": "rgba(24,20,33,0.64)",
      "--home-mesh":
        "radial-gradient(circle at 12% 15%, rgba(142,113,212,0.22), transparent 28%), radial-gradient(circle at 86% 18%, rgba(106,79,176,0.12), transparent 32%), linear-gradient(145deg, #f1eef7 0%, #faf8ff 54%, #e8e1f6 100%)",
    } as CSSProperties,
    frameClass:
      "border-[#6a4fb0]/10 bg-[var(--home-surface)] shadow-[0_34px_90px_rgba(106,79,176,0.10)] backdrop-blur-xl",
    cardClass: "border-[#6a4fb0]/10 bg-white/66",
    softCardClass: "border-[#8e71d4]/18 bg-[#8e71d4]/8",
    accentChipClass: "border-[#8e71d4]/20 bg-[#f0ebfb] text-[#5a4394]",
    mutedClass: "text-[var(--home-muted)]",
    buttonClass: "bg-[#201735] text-[#f6f2ff] hover:bg-[#161020]",
    secondaryButtonClass:
      "border-[#6a4fb0]/12 bg-white/72 text-[#201735] hover:bg-white",
  },
};

const reasonCards = [
  {
    title: "Review keeps the bar visible",
    copy: "Published work feels filtered, not dumped.",
    icon: ShieldCheck,
  },
  {
    title: "Structure keeps good work alive",
    copy: "Categories and tags do the discovery work.",
    icon: Compass,
  },
  {
    title: "Presentation attracts stronger authors",
    copy: "The product itself signals contributor pride.",
    icon: Spark,
  },
];

const audience = [
  "Undergraduates",
  "Freshers",
  "Senior engineers",
  "Specialists",
  "Mentors",
  "Tech leads",
];

const fallbackTopics = [
  "Frontend craft",
  "Backend systems",
  "Architecture",
  "Cloud infra",
  "AI tooling",
  "Engineering growth",
];

const fallbackTags = [
  "Postmortems",
  "Testing",
  "System design",
  "Performance",
  "Developer habits",
  "Career notes",
];

const statLabels: Array<keyof HomePageStats> = [
  "publishedCount",
  "contributorCount",
  "categoryCount",
  "tagCount",
];

const statNames: Record<keyof HomePageStats, string> = {
  publishedCount: "Published",
  contributorCount: "Contributors",
  categoryCount: "Categories",
  tagCount: "Approved tags",
};

const fallbackStatCards: Array<{
  key: keyof HomePageStats;
  value: string;
  label: string;
}> = [
  {
    key: "publishedCount",
    value: "Reviewed",
    label: "Every piece earns its place",
  },
  {
    key: "contributorCount",
    value: "Respected",
    label: "Built for serious authors",
  },
  {
    key: "categoryCount",
    value: "Findable",
    label: "Readers know where to begin",
  },
  {
    key: "tagCount",
    value: "Clear",
    label: "Signal stays visible",
  },
];

const numberFormat = new Intl.NumberFormat("en-US");

function cleanList<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function summarize(article: Article, length: number) {
  return deriveArticleSummary(article.content_text, length);
}

function formatMeta(article: Article) {
  const date = formatArticleDate(article.published_at || article.updated_at, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    date,
    readingTime: getArticleReadingTimeMinutes(article.content_text),
  };
}

function getArticleDeck(data: HomeContentData) {
  return cleanList([...data.featured, ...data.recent]);
}

function topicItems(data: HomeContentData) {
  const categories = data.categories.length
    ? data.categories.slice(0, 6).map((item) => ({
        id: item.id,
        label: item.name,
        href: `/articles?category=${item.slug}`,
      }))
    : fallbackTopics.map((item) => ({
        id: item,
        label: item,
        href: "/articles",
      }));

  const tags = data.tags.length
    ? data.tags.slice(0, 8).map((item) => ({
        id: item.id,
        label: item.name,
        href: `/articles?tag=${item.slug}`,
      }))
    : fallbackTags.map((item) => ({
        id: item,
        label: item,
        href: "/articles",
      }));

  return { categories, tags };
}

function useMotionSettings() {
  const reduceMotion = useReducedMotion();

  return {
    reduceMotion,
    fadeUp: {
      initial: { opacity: 0, y: reduceMotion ? 0 : 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7 },
    },
    popIn: {
      initial: { opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 18 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0.75 },
    },
  };
}

function MotionRibbon({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const looped = [...items, ...items];

  return (
    <div className="overflow-hidden rounded-full border border-[var(--home-border)] bg-[var(--home-surface)] py-2">
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: reverse ? 24 : 28,
                repeat: Infinity,
                ease: "linear",
              }
        }
        className="flex w-max items-center gap-2 px-2"
      >
        {looped.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-[var(--home-border)] bg-[var(--home-surface-2)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--home-muted)]"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function MetricRow({ stats }: { stats: HomePageStats }) {
  const hasData = statLabels.some((key) => stats[key] > 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statLabels.map((key, index) => (
        <div
          key={key}
          className="rounded-[1.35rem] border border-[var(--home-border)] bg-[var(--home-surface)] px-4 py-4 backdrop-blur-xl"
        >
          {hasData ? (
            <>
              <p className="text-[1.35rem] font-semibold tracking-tight text-[var(--home-text)]">
                {numberFormat.format(stats[key])}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--home-muted)]">
                {statNames[key]}
              </p>
            </>
          ) : (
            <>
              <p className="text-[1.1rem] font-semibold tracking-tight text-[var(--home-text)]">
                {fallbackStatCards[index].value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--home-muted)]">
                {fallbackStatCards[index].label}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function SpotlightCard({
  article,
  theme,
  imageScale,
  imageRotate,
}: {
  article: Article | undefined;
  theme: ThemeConfig;
  imageScale: MotionValue<number>;
  imageRotate: MotionValue<number>;
}) {
  if (!article) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] border p-8",
          theme.frameClass,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
        <p className="relative text-sm leading-7 text-[var(--home-muted)]">
          Featured work will live here as soon as the first editorial set is
          published.
        </p>
      </div>
    );
  }

  const meta = formatMeta(article);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.12 }}
      whileHover={{ y: -8 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border",
        theme.frameClass,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.44)_100%)]" />
      <div className="relative min-h-[21rem] sm:min-h-[26rem]">
        {article.cover_image ? (
          <motion.div
            style={{ scale: imageScale, rotate: imageRotate }}
            className="absolute inset-0"
          >
            <ManagedImage
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 42vw"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%),linear-gradient(145deg,var(--home-bg-2),var(--home-bg))]" />
        )}

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.28 }}
          className="absolute inset-x-0 bottom-0 p-5 sm:p-7"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]", theme.accentChipClass)}>
              Featured
            </span>
            {article.category_name ? (
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/75">
                {article.category_name}
              </span>
            ) : null}
          </div>

          <Link href={`/articles/${article.slug}`} className="block max-w-xl">
            <h2 className="max-w-2xl text-[1.95rem] font-semibold leading-[1.02] text-white sm:text-4xl">
              {article.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/76">
              {summarize(article, 112)}
            </p>
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/65">
            {article.author_name ? (
              <Link href={`/authors/${article.author_id}`} className="hover:text-white">
                {article.author_name}
              </Link>
            ) : null}
            <span>{meta.readingTime} min</span>
            {meta.date ? <span>{meta.date}</span> : null}
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

function StoryMini({
  article,
  theme,
}: {
  article: Article;
  theme: ThemeConfig;
}) {
  const meta = formatMeta(article);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, rotate: -0.4 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={cn("rounded-[1.6rem] border p-5", theme.cardClass)}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--home-muted)]">
          {article.category_name || "Article"}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--home-accent)]" />
      </div>
      <Link href={`/articles/${article.slug}`} className="mt-4 block">
        <h3 className="text-xl font-semibold leading-tight text-[var(--home-text)]">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--home-muted)]">
          {summarize(article, 92)}
        </p>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--home-muted)]">
        {article.author_name ? (
          <Link href={`/authors/${article.author_id}`}>{article.author_name}</Link>
        ) : null}
        <span>{meta.readingTime} min</span>
      </div>
    </motion.article>
  );
}

export function HomeContent({ data }: HomeContentProps) {
  const { theme: pubTheme } = usePubTheme();
  const theme = HOME_THEMES[pubTheme];
  const { popIn, reduceMotion } = useMotionSettings();
  const deck = getArticleDeck(data);
  const spotlight = deck[0];
  const stories = deck.slice(1, 4);
  const { categories, tags } = topicItems(data);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTranslateY = useSpring(
    useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 110]),
    { stiffness: 120, damping: 24, mass: 0.2 },
  );
  const heroContentY = useSpring(
    useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -36]),
    { stiffness: 120, damping: 24, mass: 0.2 },
  );
  const spotlightScale = useSpring(
    useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.02, 1.12]),
    { stiffness: 80, damping: 20 },
  );
  const spotlightRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -2],
  );
  const orbLeftY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -70],
  );
  const orbRightY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, 90],
  );
  const haloWidth = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["18rem", "18rem"] : ["18rem", "34rem"],
  );
  const haloGradient = useMotionTemplate`radial-gradient(circle at center, color-mix(in srgb, var(--home-accent) 28%, transparent) 0%, transparent 70%)`;
  const ribbonItems = [...categories.map((item) => item.label), ...tags.map((item) => item.label)];

  return (
    <main
      style={theme.palette}
      className="relative -mt-14 overflow-hidden bg-[var(--home-bg)] text-[var(--home-text)]"
    >
      <div className="home-noise absolute inset-0 opacity-55" />
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 4, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: orbLeftY }}
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[var(--home-accent)]/12 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.04, 1, 1.05], x: [0, -16, 0], y: [0, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: orbRightY }}
        className="pointer-events-none absolute right-0 top-14 h-[26rem] w-[26rem] rounded-full bg-[var(--home-accent)]/10 blur-3xl"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--home-mesh)" }}
      />
      <motion.div
        style={{ width: haloWidth, backgroundImage: haloGradient }}
        className="pointer-events-none absolute left-1/2 top-24 h-[22rem] -translate-x-1/2 blur-3xl"
      />

      <section
        ref={heroRef}
        className="relative mx-auto max-w-7xl px-5 pb-12 pt-20 sm:px-8 sm:pb-14 sm:pt-24 lg:px-10"
      >
        <div className="grid gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-end">
          <motion.div {...popIn} style={{ y: heroContentY }} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--home-accent-2)]">
              {theme.kicker}
            </p>
            <h1 className="mt-5 text-[2.9rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:text-7xl lg:text-[5.55rem]">
              {theme.title.split(theme.accent)[0]}
              <span className="text-[var(--home-accent-2)]">{theme.accent}</span>
              {theme.title.split(theme.accent)[1]}
            </h1>
            <p className={cn("mt-6 max-w-xl text-lg leading-8", theme.mutedClass)}>
              {theme.body}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className={cn(
                  "inline-flex w-full items-center justify-between gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all sm:w-auto sm:justify-center",
                  theme.buttonClass,
                )}
              >
                Start publishing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/articles"
                className={cn(
                  "inline-flex w-full items-center justify-between gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all sm:w-auto sm:justify-center",
                  theme.secondaryButtonClass,
                )}
              >
                Explore articles
              </Link>
            </div>

            <div className="mt-8 hidden flex-wrap gap-2 sm:flex">
              {audience.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--home-border)] bg-[var(--home-surface)] px-3 py-1.5 text-xs text-[var(--home-muted)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroTranslateY }}
            className="relative min-h-0 sm:min-h-[34rem]"
          >
            <div className="relative sm:absolute sm:inset-x-0 sm:top-6 sm:bottom-0">
              <SpotlightCard
                article={spotlight}
                theme={theme}
                imageScale={spotlightScale}
                imageRotate={spotlightRotate}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="mt-10"
        >
          <MetricRow stats={data.stats} />
        </motion.div>

        {ribbonItems.length > 0 ? (
          <div className="mt-6 grid gap-3">
            <MotionRibbon items={ribbonItems} />
            <MotionRibbon items={ribbonItems.slice().reverse()} reverse />
          </div>
        ) : null}
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {reasonCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className={cn("rounded-[1.7rem] border p-5", theme.cardClass)}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent)]/12 text-[var(--home-accent-2)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold leading-tight">
                  {item.title}
                </h2>
                <p className={cn("mt-2 text-sm leading-7", theme.mutedClass)}>
                  {item.copy}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="grid gap-4">
            {stories.length > 0 ? (
              stories.map((article) => (
                <StoryMini key={article.id} article={article} theme={theme} />
              ))
            ) : (
              <div className={cn("rounded-[1.8rem] border p-6", theme.cardClass)}>
                <p className={cn("text-sm leading-7", theme.mutedClass)}>
                  Recent articles will appear here once the first editorial set
                  is live.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className={cn("rounded-[1.8rem] border p-6", theme.frameClass)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent)]/12 text-[var(--home-accent-2)]">
                  <MultiplePages className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--home-muted)]">
                    Topic structure
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Browse by topic, not by noise.</h2>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-sm transition-colors",
                      theme.softCardClass,
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.62, delay: 0.05 }}
              className={cn("rounded-[1.8rem] border p-6", theme.cardClass)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent)]/12 text-[var(--home-accent-2)]">
                  <OpenBook className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--home-muted)]">
                    Useful entry points
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Readers should know where to begin.</h2>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-full border border-[var(--home-border)] bg-[var(--home-surface)] px-3.5 py-2 text-sm text-[var(--home-muted)] transition-colors hover:border-[var(--home-accent)]/30 hover:text-[var(--home-text)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className={cn("rounded-[1.8rem] border p-6", theme.cardClass)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent)]/12 text-[var(--home-accent-2)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--home-muted)]">
                    Publishing flow
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Draft. Review. Publish.</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  "Writers draft with live preview.",
                  "Moderation protects quality.",
                  "Published work compounds over time.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={cn("rounded-[1.25rem] border p-4", theme.softCardClass)}
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--home-muted)]">
                      0{index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--home-text)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className={cn(
            "overflow-hidden rounded-[2.2rem] border p-8 sm:p-10",
            theme.frameClass,
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_36%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--home-accent-2)]">
                Final read
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
                The homepage should feel like the audience got more serious.
              </h2>
              <p className={cn("mt-4 max-w-xl text-base leading-8", theme.mutedClass)}>
                That is the standard here: less clutter, more signal, and a
                product surface contributors would actually be happy to share.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all",
                  theme.buttonClass,
                )}
              >
                Create writer account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/moderation-policy"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all",
                  theme.secondaryButtonClass,
                )}
              >
                See moderation policy
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
