'use client'

import GamesView from "@game/games/gamesView";
import {Game} from "@game/games/types";
import {useEffect, useState} from "react";
import {get_all_games} from "@game/games/server";


const GamesController = () => {
  const [games, setGames] = useState<Game[]>([] as Game[])

  // current games list refresh rate in milliseconds
  const refresh_rate_ms: number = 5000

  // update games every refresh_rate
  useEffect(() => {
    const interval = setInterval(() => {
      // get all games from graphql server and store it
      get_all_games().then((games) => {
        setGames(games)
      })
    }, refresh_rate_ms)

    // clear interval every time leave page
    return () => clearInterval(interval)
  }, [])

  return(
    <GamesView games={games} />
  )
}

export default GamesController