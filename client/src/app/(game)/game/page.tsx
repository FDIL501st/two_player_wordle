import GameController from "@/game/gameController";
import GameView from "@/game/GameView";
import GuessProvider from "@/game/Contexts/GuessProvider";

export default function GamePage() {
  return(
    <GameController>
      <GuessProvider>
        <GameView />
      </GuessProvider>
    </GameController>
  )
}