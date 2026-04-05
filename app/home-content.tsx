"use client";

import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check } from "iconoir-react";
import { ManagedImage } from "@/components/ui/managed-image";
import type { Article } from "@/lib/actions/articles";
import type { HomePageStats } from "@/lib/actions/home";
import {
  deriveArticleSummary,
  formatArticleDate,
  getArticleReadingTimeMinutes,
} from "@/lib/article-metadata";
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
  palette: CSSProperties;
}

const HOME_THEMES: Record<"cream" | "lavender", ThemeConfig> = {
  cream: {
    palette: {
      "--home-bg": "#faf8f5",
      "--home-surface": "#ffffff",
      "--home-surface-soft": "rgba(255,255,255,0.6)",
      "--home-border": "rgba(0,0,0,0.06)",
      "--home-border-strong": "rgba(0,0,0,0.12)",
      "--home-accent": "#2d2d2d",
      "--home-accent-soft": "#6b6b6b",
      "--home-text": "#0a0a0a",
      "--home-text-muted": "#6b6b6b",
      "--home-text-subtle": "#9b9b9b",
      "--home-highlight": "#f0ede8",
      "--home-gradient": "linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%)",
      // warm amber + rose + soft violet — very low opacity, light-on-light
      "--home-glass-1": "rgba(251, 191, 36, 0.18)",
      "--home-glass-2": "rgba(244, 114, 182, 0.13)",
      "--home-glass-3": "rgba(167, 139, 250, 0.11)",
    } as CSSProperties,
  },
  lavender: {
    palette: {
      "--home-bg": "#f8f7fb",
      "--home-surface": "#ffffff",
      "--home-surface-soft": "rgba(255,255,255,0.6)",
      "--home-border": "rgba(0,0,0,0.06)",
      "--home-border-strong": "rgba(0,0,0,0.12)",
      "--home-accent": "#2d2d2d",
      "--home-accent-soft": "#6b6b6b",
      "--home-text": "#0a0a0a",
      "--home-text-muted": "#6b6b6b",
      "--home-text-subtle": "#9b9b9b",
      "--home-highlight": "#f0eef5",
      "--home-gradient": "linear-gradient(135deg, #f8f7fb 0%, #f3f1f8 100%)",
      // violet + sky + indigo — cool tones, very soft
      "--home-glass-1": "rgba(139, 92, 246, 0.16)",
      "--home-glass-2": "rgba(56, 189, 248, 0.12)",
      "--home-glass-3": "rgba(99, 102, 241, 0.1)",
    } as CSSProperties,
  },
};

function cleanList<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
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

function useMotionSettings() {
  const reduceMotion = useReducedMotion();
  return {
    reduceMotion,
    fadeUp: {
      initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };
}

function SplitText({ children, delay = 0 }: { children: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");
  
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + i * 0.03,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="inline-block"
          style={{ marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const meta = formatMeta(article);
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: "easeOut" as const,
      }}
      className="group relative flex h-full"
    >
      <Link
        href={`/articles/${article.slug}`}
        className="flex h-full w-full flex-col rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-all duration-300 hover:border-[var(--home-border-strong)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8"
      >
        <div className="relative mb-6 aspect-[2/1] overflow-hidden rounded-xl bg-[var(--home-highlight)]">
          <ManagedImage
            src={article.cover_image || "/images/article-default.svg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 text-xs text-[var(--home-text-subtle)]">
            {article.category_name && (
              <span className="font-medium">{article.category_name}</span>
            )}
            <span>·</span>
            <span>{meta.readingTime} min read</span>
          </div>

          <h3 className="mt-3 font-display text-2xl font-medium leading-tight text-[var(--home-text)] transition-colors group-hover:text-[var(--home-accent-soft)]">
            {article.title}
          </h3>

          <p className="mt-3 flex-1 leading-relaxed text-[var(--home-text-muted)]">
            {summarize(article, 140)}
          </p>

          {article.author_name && (
            <div className="mt-5 flex items-center gap-3 text-sm text-[var(--home-text-subtle)]">
              <span>{article.author_name}</span>
              {meta.date && (
                <>
                  <span>·</span>
                  <span>{meta.date}</span>
                </>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

function DragonStack({ reduceMotion, size = "lg" }: { reduceMotion: boolean; size?: "lg" | "mobile" }) {
  const [fanned, setFanned] = useState(false);
  const [positions, setPositions] = useState<("front" | "left" | "right")[]>(["front", "left", "right"]);

  const spring = { type: "spring" as const, stiffness: 220, damping: 24 };

  const dims = { lg: [200, 220], mobile: [280, 308] } as const;
  const [w, h] = dims[size];
  const s = size === "mobile" ? 1.4 : 1;

  const dragons = [
    { filter: undefined, alt: "Baby dragon mascot" },
    { filter: "grayscale(1) brightness(1.1) contrast(0.85)", alt: "" },
    { filter: "sepia(0.9) saturate(1.5) hue-rotate(5deg) brightness(1.05)", alt: "" },
  ];

  const stackedStyles: Record<"front" | "left" | "right", Record<string, number>> = {
    front: { x: 0,       y: 0,      rotate: 0,  scale: 1,    opacity: 1,    zIndex: 3 },
    left:  { x: -8 * s,  y: 4 * s,  rotate: -3, scale: 0.94, opacity: 0.65, zIndex: 2 },
    right: { x: 10 * s,  y: 6 * s,  rotate: 4,  scale: 0.92, opacity: 0.7,  zIndex: 1 },
  };

  const fannedStyles: Record<"front" | "left" | "right", Record<string, number>> = {
    front: { x: 0,        y: -16 * s, rotate: 0,   scale: 1.08, opacity: 1, zIndex: 3 },
    left:  { x: -72 * s,  y: -10 * s, rotate: -12, scale: 1.04, opacity: 1, zIndex: 2 },
    right: { x: 72  * s,  y: -10 * s, rotate: 12,  scale: 1.04, opacity: 1, zIndex: 1 },
  };

  function handleFrontTap() {
    // on desktop this is covered by hover; on touch, tap front to toggle fan
    setFanned((f) => !f);
  }

  function bringToFront(clickedIdx: number) {
    const clickedPos = positions[clickedIdx];
    if (clickedPos === "front") {
      handleFrontTap();
      return;
    }
    const currentFrontIdx = positions.indexOf("front");
    setPositions((prev) => {
      const next = [...prev] as ("front" | "left" | "right")[];
      next[currentFrontIdx] = clickedPos;
      next[clickedIdx] = "front";
      return next;
    });
    setFanned(false);
  }

  return (
    <div
      className="relative select-none"
      style={{ width: w, height: h }}
      onMouseEnter={() => setFanned(true)}
      onMouseLeave={() => setFanned(false)}
    >
      {dragons.map((dragon, idx) => {
        const pos = positions[idx];
        const isFront = pos === "front";
        const style = fanned ? fannedStyles[pos] : stackedStyles[pos];
        const { zIndex, ...animProps } = style;
        return (
          <motion.div
            key={idx}
            className={fanned && !isFront ? "absolute inset-0 cursor-pointer" : "absolute inset-0 cursor-pointer"}
            animate={reduceMotion ? {} : animProps}
            transition={spring}
            style={{ zIndex, pointerEvents: "auto" }}
            onClick={() => bringToFront(idx)}
          >
            <motion.div
              animate={reduceMotion || fanned ? {} : {
                y: isFront ? [0, -10, 0] : [0, -5, 0],
                rotate: isFront ? [-1.5, 1.5, -1.5] : [0, 0, 0],
              }}
              transition={{ duration: isFront ? 5 : 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "relative", width: w, height: h }}
            >
              <ManagedImage
                src="/images/baby-dragon.png"
                alt={dragon.alt}
                fill
                loading={isFront ? "eager" : "lazy"}
                sizes={`${w}px`}
                className={`object-contain ${isFront ? "drop-shadow-2xl" : "drop-shadow-lg"}`}
                style={dragon.filter ? { filter: dragon.filter } : undefined}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Ground glow */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: w * 0.5, height: 18,
          background: "radial-gradient(ellipse, rgba(167,139,250,0.35), transparent 70%)",
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />
    </div>
  );
}

export function HomeContent({ data }: HomeContentProps) {
  const { theme: pubTheme } = usePubTheme();
  const theme = HOME_THEMES[pubTheme];
  const { reduceMotion } = useMotionSettings();
  const deck = getArticleDeck(data);
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useSpring(
    useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -40]),
    { stiffness: 100, damping: 30 }
  );

  const hasStats = data.stats.publishedCount > 0;

  return (
    <main
      style={{ ...theme.palette, position: "relative" }}
      className="relative -mt-14 bg-[var(--home-bg)] text-[var(--home-text)]"
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{ position: "relative" }}
        className="relative overflow-hidden border-b border-[var(--home-border)]"
      >
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-[var(--home-gradient)]" />
        
        {/* Soft glassmorphism color washes — no hard edges, no backdrop-filter */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {/* Top-left wash */}
          <motion.div
            animate={reduceMotion ? {} : { x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              top: "-20%",
              left: "-15%",
              width: "65%",
              height: "80%",
              background: `radial-gradient(ellipse at center, var(--home-glass-1) 0%, transparent 65%)`,
              filter: "blur(48px)",
            }}
          />
          {/* Top-right wash */}
          <motion.div
            animate={reduceMotion ? {} : { x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              top: "-10%",
              right: "-20%",
              width: "60%",
              height: "75%",
              background: `radial-gradient(ellipse at center, var(--home-glass-2) 0%, transparent 65%)`,
              filter: "blur(56px)",
            }}
          />
          {/* Bottom-center wash */}
          <motion.div
            animate={reduceMotion ? {} : { x: [0, 20, -20, 0], y: [0, -15, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              bottom: "-20%",
              left: "25%",
              width: "55%",
              height: "70%",
              background: `radial-gradient(ellipse at center, var(--home-glass-3) 0%, transparent 65%)`,
              filter: "blur(52px)",
            }}
          />
        </div>
        
        <motion.div
          style={{ y: heroY }}
          className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40 lg:px-12"
        >
          {/* Baby Dragon Stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block"
            style={{ zIndex: 0 }}
          >
            <DragonStack reduceMotion={!!reduceMotion} />
          </motion.div>

          <div className="max-w-4xl">
            {/* Main Headline with Staggered Animation */}
            <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-[var(--home-text)] sm:text-6xl lg:text-7xl">
              <SplitText delay={0.1}>
                Where specialists share knowledge worth keeping
              </SplitText>
            </h1>
            
            {/* Subtitle with Fade In */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
              className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--home-text-muted)] sm:text-2xl"
            >
              A publishing platform built for technical depth, human curation, and lasting value.
            </motion.p>

            {/* CTA Buttons with Magnetic Effect */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--home-accent)] px-8 py-4 text-base font-medium text-white transition-all hover:shadow-2xl hover:shadow-[var(--home-accent)]/20"
                >
                  <span className="relative z-10">Start writing</span>
                  <ArrowRight className="relative z-10 size-5 transition-transform group-hover:translate-x-1" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--home-accent)] to-[var(--home-accent-soft)]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/articles"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-[var(--home-border-strong)] bg-[var(--home-surface)]/80 px-8 py-4 text-base font-medium text-[var(--home-text)] backdrop-blur-sm transition-all hover:border-[var(--home-accent)] hover:bg-[var(--home-surface)] hover:shadow-lg"
                >
                  Explore articles
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Mobile dragon stack — shown below CTA buttons, hidden on lg where it floats in hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-10 flex justify-center lg:hidden"
            >
              <DragonStack reduceMotion={!!reduceMotion} size="mobile" />
            </motion.div>
          </div>

          {hasStats && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="mt-20 hidden grid-cols-2 gap-8 sm:grid sm:grid-cols-4"
            >
              {[
                { label: "Published articles", value: data.stats.publishedCount },
                { label: "Contributors", value: data.stats.contributorCount },
                { label: "Categories", value: data.stats.categoryCount },
                { label: "Topics", value: data.stats.tagCount },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.9 + index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.05 }}
                    className="text-4xl font-medium text-[var(--home-text)] sm:text-5xl"
                  >
                    {stat.value.toLocaleString()}
                  </motion.div>
                  <div className="mt-2 text-sm text-[var(--home-text-subtle)] transition-colors group-hover:text-[var(--home-text-muted)]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Why Commons */}
      <section className="border-b border-[var(--home-border)] bg-[var(--home-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h2 className="font-display text-4xl font-medium leading-tight text-[var(--home-text)] sm:text-5xl">
              Built for quality, not quantity
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-[var(--home-text-muted)]">
              Every article is reviewed. Every contributor is respected. Every reader finds signal, not noise.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {[
              {
                title: "Human curation",
                description: "Editorial review ensures every published piece meets our standards for clarity, depth, and value.",
              },
              {
                title: "Lasting value",
                description: "Well-structured categories and tags help readers discover content that remains relevant over time.",
              },
              {
                title: "Professional home",
                description: "A platform that reflects the quality of work you produce, not just another content dump.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-[var(--home-highlight)]">
                  <Check className="size-6 text-[var(--home-accent)]" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-[var(--home-text)]">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--home-text-muted)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      {deck.length > 0 && (
        <section className="border-b border-[var(--home-border)]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="font-display text-4xl font-medium text-[var(--home-text)] sm:text-5xl">
                Recent articles
              </h2>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {deck.slice(0, 6).map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-base font-medium text-[var(--home-accent)] transition-colors hover:text-[var(--home-accent-soft)]"
              >
                View all articles
                <ArrowRight className="size-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Topics */}
      {(data.categories.length > 0 || data.tags.length > 0) && (
        <section className="border-b border-[var(--home-border)] bg-[var(--home-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl font-medium text-[var(--home-text)] sm:text-5xl">
                Explore by topic
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--home-text-muted)]">
                Browse curated categories and popular tags to find content that matters to you.
              </p>
            </motion.div>

            {data.categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-12"
              >
                <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--home-text-subtle)]">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.categories.slice(0, 8).map((category) => (
                    <Link
                      key={category.id}
                      href={`/articles?category=${category.slug}`}
                      className="group rounded-full border border-[var(--home-border-strong)] bg-[var(--home-surface)] px-6 py-3 text-sm font-medium text-[var(--home-text)] transition-all hover:border-[var(--home-accent)] hover:shadow-md"
                    >
                      <span className="transition-colors group-hover:text-[var(--home-accent)]">
                        {category.name}
                      </span>
                      <span className="ml-2 text-[var(--home-text-subtle)]">
                        {category.article_count}
                      </span>
                    </Link>
                  ))}
                </div>
                {data.categories.length > 8 && (
                  <Link
                    href="/articles"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--home-accent)] transition-colors hover:text-[var(--home-accent-soft)]"
                  >
                    View all categories
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </motion.div>
            )}

            {data.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-12"
              >
                <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--home-text-subtle)]">
                  Popular tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.tags.slice(0, 12).map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/articles?tag=${tag.slug}`}
                      className="group rounded-full bg-[var(--home-highlight)] px-5 py-2.5 text-sm text-[var(--home-text-muted)] transition-all hover:bg-[var(--home-border-strong)] hover:text-[var(--home-text)]"
                    >
                      <span>{tag.name}</span>
                      <span className="ml-2 text-xs text-[var(--home-text-subtle)]">
                        {tag.article_count}
                      </span>
                    </Link>
                  ))}
                </div>
                {data.tags.length > 12 && (
                  <Link
                    href="/articles"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--home-accent)] transition-colors hover:text-[var(--home-accent-soft)]"
                  >
                    View all tags
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-[var(--home-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-display text-4xl font-medium leading-tight text-[var(--home-text)] sm:text-5xl lg:text-6xl">
              Share knowledge that lasts
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--home-text-muted)]">
              Join a community of specialists who value depth, clarity, and lasting impact over viral moments.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--home-accent)] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[var(--home-accent-soft)] hover:shadow-lg"
              >
                Create your account
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/moderation-policy"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border-strong)] bg-[var(--home-surface)] px-8 py-4 text-base font-medium text-[var(--home-text)] transition-all hover:border-[var(--home-accent)] hover:shadow-md"
              >
                Read our standards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
