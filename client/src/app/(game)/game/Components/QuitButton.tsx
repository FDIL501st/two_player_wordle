'use client'

import {clearGameSession, useGameSessionDispatch} from "@/(game)/GameSessionProvider";
import {useRouter} from "next/navigation";

const QuitButton = () => {
  const dispatch = useGameSessionDispatch()
  const router = useRouter()

  /**
   * Quit the game and go back to /games.
   */
  function handleQuit() {
    clearGameSession(dispatch)
    router.push("/games")
  }

  return (
    <button onClick={handleQuit}>
      Quit Game
    </button>
  );
};

export default QuitButton