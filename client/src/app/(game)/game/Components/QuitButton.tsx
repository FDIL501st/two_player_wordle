'use client'

import {useRouter} from "next/navigation";
import {useAppDispatch} from "@/lib/hooks";
import {reset} from "@/lib/features/gameSession/gameSessionSlice";
import {clear} from "@/lib/features/guess/guessSlice";

const QuitButton = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  /**
   * Quit the game and go back to /games.
   */
  function handleQuit() {
    dispatch(reset())
    dispatch(clear())
    // both guess and gameSession needs to be cleared when quitting a game
    router.push("/games")
  }

  return (
    <button onClick={handleQuit}>
      Quit Game
    </button>
  );
};

export default QuitButton