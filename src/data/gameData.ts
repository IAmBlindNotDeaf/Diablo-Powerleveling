export const D4LevelData = {
  // Your existing D4 level data here
};

export const D2RLevelData = {
  1: { experience: 0, experienceToNext: 500 },
  2: { experience: 500, experienceToNext: 1000 },
  3: { experience: 1500, experienceToNext: 2250 },
  4: { experience: 3750, experienceToNext: 4125 },
  5: { experience: 7875, experienceToNext: 6300 },
  // ... continue with all levels
  99: { experience: 3520485254, experienceToNext: 0 },
};

export type GameType = "D4" | "D2R";
