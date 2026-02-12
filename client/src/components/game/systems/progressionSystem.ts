const LEVEL_THRESHOLDS: Array<{ fromLevel: number; toLevel: number; minScroll: number }> = [
  { fromLevel: 1, toLevel: 2, minScroll: 45 },
  { fromLevel: 2, toLevel: 3, minScroll: 90 },
  { fromLevel: 3, toLevel: 4, minScroll: 135 },
  { fromLevel: 4, toLevel: 5, minScroll: 180 },
  { fromLevel: 5, toLevel: 6, minScroll: 225 },
  { fromLevel: 6, toLevel: 7, minScroll: 270 },
  { fromLevel: 8, toLevel: 9, minScroll: 360 },
  { fromLevel: 9, toLevel: 10, minScroll: 405 },
  { fromLevel: 10, toLevel: 11, minScroll: 450 },
  { fromLevel: 11, toLevel: 12, minScroll: 495 },
  { fromLevel: 12, toLevel: 13, minScroll: 540 },
  { fromLevel: 13, toLevel: 14, minScroll: 585 },
];

export function getNextLevel(currentLevel: number, scrollPosition: number): number | null {
  const transition = LEVEL_THRESHOLDS.find(
    ({ fromLevel, minScroll }) => currentLevel === fromLevel && scrollPosition > minScroll,
  );

  return transition?.toLevel ?? null;
}
