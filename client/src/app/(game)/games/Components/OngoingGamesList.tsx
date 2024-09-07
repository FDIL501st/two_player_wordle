'use client'

import {Game} from "@/(game)/types";
import {useContext} from "react";
import GamesQueryContext from "@/games/GamesQueryContext";

const OngoingGamesList = () => {

  const {loading, error, data} = useContext(GamesQueryContext)

  const games = data?.games

  if (loading) return <h1>Loading</h1>

  if (error) return <h3>{error.message}</h3>

  if (games?.length === 0) return <h1>NO ONGOING GAMES</h1>

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

export default OngoingGamesList


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