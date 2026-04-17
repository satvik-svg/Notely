/**
 * Active Recall Engine — Memory Strength Utilities
 *
 * Pure functions for computing spaced-repetition memory strength.
 * No external dependencies.
 */

export type MemoryEvent = "correct" | "wrong" | "chat_review" | "passive_view";

const DECAY_CONSTANT = 0.1; // k — tunable decay rate

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute current memory strength based on exponential forgetting curve.
 * S(t) = e^(-k * t), where t is hours since last review.
 */
export function computeStrength(lastReviewedAt: Date, now: Date): number {
  const hoursElapsed =
    (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60);
  return Math.exp(-DECAY_CONSTANT * Math.max(0, hoursElapsed));
}

/**
 * Update strength score based on a memory event.
 * Returns clamped [0, 1] score.
 */
export function updateStrength(
  currentStrength: number,
  event: MemoryEvent
): number {
  const deltas: Record<MemoryEvent, number> = {
    correct: 0.2,
    wrong: -0.15,
    chat_review: 0.1,
    passive_view: 0.05,
  };

  return clamp(currentStrength + (deltas[event] ?? 0), 0, 1);
}

/**
 * Compute hours until next review based on current strength.
 * Higher strength → longer interval before next review.
 *
 * Mapping (approximate):
 *   0.0 → 1 hour
 *   0.5 → 12 hours
 *   1.0 → 72 hours (3 days)
 */
export function computeNextReviewHours(strength: number): number {
  const clamped = clamp(strength, 0, 1);
  // Exponential spacing: 1h at 0, ~72h at 1
  return 1 + 71 * Math.pow(clamped, 2);
}

/**
 * Compute the next review Date from strength + current time.
 */
export function computeNextReviewAt(strength: number, now: Date): Date {
  const hours = computeNextReviewHours(strength);
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Priority bucket for UI display.
 */
export type MemoryPriority = "critical" | "due" | "strong";

export function getPriority(strength: number): MemoryPriority {
  if (strength < 0.3) return "critical";
  if (strength <= 0.5) return "due";
  return "strong";
}
