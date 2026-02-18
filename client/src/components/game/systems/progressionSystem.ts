interface LevelTransition {
  toLevel: number;
  minScroll: number;
}

const LEVEL_LENGTH = 59;

const LEVEL_TRANSITIONS: Record<number, LevelTransition> = {
  1: { toLevel: 2, minScroll: LEVEL_LENGTH },
  2: { toLevel: 3, minScroll: LEVEL_LENGTH * 2 },
  3: { toLevel: 4, minScroll: LEVEL_LENGTH * 3 },
  4: { toLevel: 5, minScroll: LEVEL_LENGTH * 4 },
  5: { toLevel: 6, minScroll: LEVEL_LENGTH * 5 },
  6: { toLevel: 7, minScroll: LEVEL_LENGTH * 6 },
  8: { toLevel: 9, minScroll: LEVEL_LENGTH * 8 },
  9: { toLevel: 10, minScroll: LEVEL_LENGTH * 9 },
  10: { toLevel: 11, minScroll: LEVEL_LENGTH * 10 },
  11: { toLevel: 12, minScroll: LEVEL_LENGTH * 11 },
  12: { toLevel: 13, minScroll: LEVEL_LENGTH * 12 },
  13: { toLevel: 14, minScroll: LEVEL_LENGTH * 13 },
};

export function getNextLevel(currentLevel: number, scrollPosition: number): number | null {
  const transition = LEVEL_TRANSITIONS[currentLevel];
  if (!transition) return null;

  return scrollPosition > transition.minScroll ? transition.toLevel : null;
}
