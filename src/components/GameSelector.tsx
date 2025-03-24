import React from "react";
import { GameType } from "../data/gameData";

interface GameSelectorProps {
  selectedGame: GameType;
  onGameChange: (game: GameType) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGame,
  onGameChange,
}) => {
  return (
    <div className="game-selector">
      <label>
        Select Game:
        <select
          value={selectedGame}
          onChange={(e) => onGameChange(e.target.value as GameType)}
        >
          <option value="D4">Diablo 4</option>
          <option value="D2R">Diablo 2 Resurrected</option>
        </select>
      </label>
    </div>
  );
};
