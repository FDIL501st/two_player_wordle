'use client'

import GamesQueryContext from "@games/GamesQueryContext";
import {useQuery} from "@apollo/client";
import {gql} from "@/__generated__";
import {Children} from "@app/types";

const GET_GAMES = gql(/* GRAPHQL */ `
  query GetGames {
    games {
      id,
      p1Points,
      p2Points,
      roundNum
    }
  }
`)

const GamesController = ({children}: Children) => {
  // current games list refresh rate in milliseconds
  const refresh_rate_ms: number = 5000

  // get games from graphql server
  const { loading, error, data } = useQuery(GET_GAMES, {
    pollInterval: refresh_rate_ms
  });

  return(
    <GamesQueryContext.Provider value={{loading, error, data}}>
      {children}
    </GamesQueryContext.Provider>
  )
}

export default GamesController