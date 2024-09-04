import GamesController from "@games/gamesController";
import GamesView from "@games/gamesView";

export default function GamesPage() {
  return(
      <GamesController>
        <GamesView />
      </GamesController>
  )
}