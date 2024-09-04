'use client'

import {GameSession} from "@(game)/types";
import {useGameSession} from "@(game)/GameSessionProvider";

const Game = () => {
  const gameSession: GameSession | null = useGameSession()

  return (
    <div>
      Game ID: {gameSession?.game_id}
      Client Type: {gameSession?.client_type}
    </div>
  );
};

export default Game