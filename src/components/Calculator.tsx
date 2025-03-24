import React, { useState } from "react";
import { GameSelector } from "./GameSelector";
import { D4LevelData, D2RLevelData, GameType } from "../data/gameData";

export const Calculator: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>("D4");

  // Get the appropriate level data based on game selection
  const getLevelData = () => {
    return selectedGame === "D4" ? D4LevelData : D2RLevelData;
  };

  // Your existing calculation functions, but using getLevelData()
  const calculateExperience = () => {
    const levelData = getLevelData();
    // Use levelData in your calculations
  };

  return (
    <div>
      <GameSelector
        selectedGame={selectedGame}
        onGameChange={setSelectedGame}
      />
      {/* Your existing calculator UI */}
    </div>
  );
};
