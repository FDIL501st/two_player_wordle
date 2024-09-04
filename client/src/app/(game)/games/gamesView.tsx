import Separator from "@games/Components/Separator";
import OngoingGamesList from "@games/Components/OngoingGamesList";
import NewGameButton from "@games/Components/NewGameButton";


const GamesView = () => {
  return(
    <div>
      <NewGameButton />
      <Separator />
      <OngoingGamesList />
    </div>
  )
}

export default GamesView


