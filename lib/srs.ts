// SM-2 spaced repetition algorithm

export interface SRSItem {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SRSResult extends SRSItem {
  nextReview: Date;
}

/**
 * Quality scale:
 * 5 – perfect recall, instantly
 * 4 – correct with minor hesitation
 * 3 – correct after significant difficulty
 * 2 – incorrect but recalled after seeing answer
 * 1 – incorrect, barely remembered
 * 0 – complete blackout
 */
export function calculateNextReview(item: SRSItem, quality: number): SRSResult {
  const q = Math.max(0, Math.min(5, quality));

  let { easeFactor, interval, repetitions } = item;

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}

export function qualityLabel(q: number): string {
  switch (q) {
    case 5: return "Perfect";
    case 4: return "Good";
    case 3: return "Hard";
    case 2: return "Again";
    case 1: return "Forgot";
    default: return "Blackout";
  }
}

export function masteryPercent(item: SRSItem): number {
  // Maps ease factor + repetitions to a 0-100 mastery score
  const efNorm = Math.min(1, (item.easeFactor - 1.3) / (3.5 - 1.3));
  const repNorm = Math.min(1, item.repetitions / 10);
  return Math.round((efNorm * 0.6 + repNorm * 0.4) * 100);
}
