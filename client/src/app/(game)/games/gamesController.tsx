'use client'

import GamesQueryContext from "@/games/GamesQueryContext";
import { gql, TypedDocumentNode } from "@apollo/client";
import {useQuery} from "@apollo/client/react";
import { GetGamesQuery, GetGamesQueryVariables } from "@/__generated__/graphql";
import {Children} from "@/app/types";


// TODO: this will not work at the moment as the query being called only returns game id, nothing else
// Come back to this once the graphql server has implemented the query to return all necessary game info for the games list page
const GET_GAMES: TypedDocumentNode<GetGamesQuery, GetGamesQueryVariables> = gql(/* GRAPHQL */ `
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