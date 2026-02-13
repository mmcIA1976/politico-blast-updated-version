interface LevelTransition {
  toLevel: number;
  minScroll: number;
}

const LEVEL_TRANSITIONS: Record<number, LevelTransition> = {
  1: { toLevel: 2, minScroll: 45 },
  2: { toLevel: 3, minScroll: 90 },
  3: { toLevel: 4, minScroll: 135 },
  4: { toLevel: 5, minScroll: 180 },
  5: { toLevel: 6, minScroll: 225 },
  6: { toLevel: 7, minScroll: 270 },
  8: { toLevel: 9, minScroll: 360 },
  9: { toLevel: 10, minScroll: 405 },
  10: { toLevel: 11, minScroll: 450 },
  11: { toLevel: 12, minScroll: 495 },
  12: { toLevel: 13, minScroll: 540 },
  13: { toLevel: 14, minScroll: 585 },
};

export function getNextLevel(currentLevel: number, scrollPosition: number): number | null {
  const transition = LEVEL_TRANSITIONS[currentLevel];
  if (!transition) return null;

  return scrollPosition > transition.minScroll ? transition.toLevel : null;
}
