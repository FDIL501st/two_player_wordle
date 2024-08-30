import Separator from "@games/components/Separator";
import OngoingGames from "@games/components/OngoingGames";
import NewGameButton from "@games/components/NewGameButton";


const GamesView = () => {
  return(
    <div>
      <NewGameButton />
      <Separator />
      <OngoingGames />
    </div>
  )
}

export default GamesView


