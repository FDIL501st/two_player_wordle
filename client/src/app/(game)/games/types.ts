/*
Defines types used within /games route
 */

import 'server-only'
import {GetGamesQuery, GetGamesQueryResult} from "@/__generated__/graphql";
import {ApolloError} from "@apollo/client";

/*
The type of client/player communicating with the game.
Spectator, P1 (player 1) or P2 (player 2).
 */
enum Client {
  Spectator = "Spectator",
  P1 = "P1",
  P2 = "P2"
}

export type NewGameResponse = {game_id: string, player_type: Client}

export type Game = GetGamesQueryResult

export type QueryResult = {
  loading: boolean,
  error: ApolloError | undefined,
  data: GetGamesQuery | undefined
}