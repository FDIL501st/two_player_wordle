import GameController from "@/game/gameController";
import GameView from "@/game/GameView";

export default function GamePage() {
  return(
    <GameController>
      <GameView />
    </GameController>
  )
}