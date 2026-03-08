"use client";

import { useCallback, useRef } from "react";

/**
 * Synthesises short, pleasant sounds for reaction feedback using the Web Audio API.
 * Each reaction type has a unique tonal character. Works on all modern browsers.
 */

let sharedCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

function resumeCtx(ctx: AudioContext) {
  if (ctx.state === "suspended") ctx.resume();
}

// ── Tone helpers ──────────────────────────────────────────

/** Short sine "pop" with pitch drop — warm, satisfying (👍 Like) */
function playPop(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(260, t + 0.12);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

/** Bright "ting" — clear, bell-like (💡 Insightful) */
function playTing(ctx: AudioContext) {
  const t = ctx.currentTime;

  // Fundamental
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.value = 880;
  gain1.gain.setValueAtTime(0.14, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.25);

  // Harmonic shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.value = 1320;
  gain2.gain.setValueAtTime(0.06, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.18);
}

/** Soft warm chord — gentle, resonant (❤️ Inspiring) */
function playWarm(ctx: AudioContext) {
  const t = ctx.currentTime;
  const freqs = [330, 415, 523]; // E4, Ab4, C5 — a warm triad
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }
}

/** Rising "hmm?" glide — curious, questioning (🤔 Curious) */
function playRise(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(340, t);
  osc.frequency.exponentialRampToValueAtTime(680, t + 0.15);
  gain.gain.setValueAtTime(0.14, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}

/** Soft descending blip — deselect / remove reaction */
function playRemove(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.1);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

// ── Public hook ───────────────────────────────────────────

type SoundType = "like" | "insightful" | "inspiring" | "curious" | "remove";

const SOUND_MAP: Record<SoundType, (ctx: AudioContext) => void> = {
  like: playPop,
  insightful: playTing,
  inspiring: playWarm,
  curious: playRise,
  remove: playRemove,
};

export function useReactionSound() {
  const enabled = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabled.current) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    resumeCtx(ctx);
    SOUND_MAP[sound](ctx);
  }, []);

  return { play };
}
