export function getNextLevel(currentLevel: number, scrollPosition: number): number | null {
  if (scrollPosition > 45 && currentLevel === 1) return 2;
  if (scrollPosition > 90 && currentLevel === 2) return 3;
  if (scrollPosition > 135 && currentLevel === 3) return 4;
  if (scrollPosition > 180 && currentLevel === 4) return 5;
  if (scrollPosition > 225 && currentLevel === 5) return 6;
  if (scrollPosition > 270 && currentLevel === 6) return 7;
  if (scrollPosition > 360 && currentLevel === 8) return 9;
  if (scrollPosition > 405 && currentLevel === 9) return 10;
  if (scrollPosition > 450 && currentLevel === 10) return 11;
  if (scrollPosition > 495 && currentLevel === 11) return 12;
  if (scrollPosition > 540 && currentLevel === 12) return 13;
  if (scrollPosition > 585 && currentLevel === 13) return 14;

  return null;
}
