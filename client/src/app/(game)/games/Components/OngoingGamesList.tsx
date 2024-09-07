'use client'

import {Client, Game} from "@/(game)/types";
import {useContext} from "react";
import GamesQueryContext from "@/games/GamesQueryContext";
import {useRouter} from "next/navigation";
import {ActionType, useGameSessionDispatch} from "@/(game)/GameSessionProvider";

const OngoingGamesList = () => {

  const {loading, error, data} = useContext(GamesQueryContext)

  const games = data?.games

  if (loading) return <h1>Loading</h1>

  if (error) return <h3>{error.message}</h3>

  if (games?.length === 0) return <h1>NO ONGOING GAMES</h1>

  return(
    <>
      {games?.map((game) => (
        <div className={"flex flex-row border-b-2"} key={game.id}>
          <div className={"basis-3/4"}>
            <OngoingGame game={game} />
          </div>
          <div className={""}>
            <SpectateButton gameID={game.id}/>
          </div>
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

const SpectateButton = ({gameID}: {gameID: string}) => {
  const router = useRouter()
  const dispatch = useGameSessionDispatch()

  function handleSpectate() {
    dispatch({
      type: ActionType.SET,
      newGameSession: {
        game_id: gameID,
        client_type: Client.Spectator
      }
    })

    router.push('/joining')
  }

  return(
    <button className={"btn btn-blue"} onClick={handleSpectate}>
      Spectate
    </button>
  )
}