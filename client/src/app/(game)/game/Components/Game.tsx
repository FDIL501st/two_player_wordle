'use client'

import {GameSession} from "@(game)/types";
import {useGameSession} from "@(game)/GameSessionProvider";
import QuitButton from "@game/Components/QuitButton";

const Game = () => {
  const gameSession: GameSession | null = useGameSession()

  return (
    <div>
      Game ID: {gameSession?.game_id}
      <br/>
      Client Type: {gameSession?.client_type}

      <hr/>
      <QuitButton />
    </div>
  );
};

export default Game