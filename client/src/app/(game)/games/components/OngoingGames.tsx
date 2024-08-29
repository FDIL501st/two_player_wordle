
import {ApolloError} from "@apollo/client";
import {Game} from "@games/types";

interface AllGamesQueryResult {
  loading: boolean,
  error: ApolloError | undefined,
  games: Game[] | undefined
}
const OngoingGames = ({loading, error, games}: AllGamesQueryResult) => {
  if (loading) return <h1>Loading</h1>

  if (error) return <h3>{error.message}</h3>

  if (games?.length === 0) return <h2>NO ONGOING GAMES</h2>

  return(
    <>
      {games?.map((game) => (
        <div key={game.id}>
          <OngoingGame game={game} />
          <hr/>
        </div>
      ))}
    </>
  )
}

export default OngoingGames


const OngoingGame = ({game}: {game: Game}) => {
  return(
    <>
      Game ID: {game.id}
      <br/>
      Round number: {game.roundNum}
      <br/>
      Player 1 Points: {game.p1Points}
      <br/>
      Player 2 Points: {game.p2Points}
      <br/>
    </>
  )
}