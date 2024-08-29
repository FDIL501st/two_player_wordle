'use client'

import {ApolloError} from "@apollo/client";
import {GetGamesQuery} from "@/__generated__/graphql";
import Separator from "@games/components/Separator";
import OngoingGames from "@games/components/OngoingGames";
import NewGameButton from "@games/components/NewGameButton";

interface QueryResult {
  loading: boolean,
  error: ApolloError | undefined,
  data: GetGamesQuery | undefined
}
const GamesView = ({loading, error, data}: QueryResult) => {
  return(
    <div>
      <NewGameButton />
      <Separator />
      <OngoingGames loading={loading} error={error} games={data?.games} />
    </div>
  )
}

export default GamesView


