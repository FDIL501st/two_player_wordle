/**
 Defines types used within the game
 */

import { GetGamesQuery, GetGameQuery } from "@/__generated__/graphql";
import { ErrorLike } from "@apollo/client";

/**
 The type of client/player communicating with the game.
 Spectator, P1 (player 1) or P2 (player 2).
 */
export enum Client {
  Spectator = "Spectator",
  P1 = "P1",
  P2 = "P2"
}

/**
 * Response from new_game route in matchmaking server
 */
export type NewGameResponse = {game_id: string, player_type: Client}

export type Game = GetGamesQuery['games'][0]; 
// get me the type of element 0 of games key, which basically is the element of a single element 

export type GetGamesQueryResult = {
  loading: boolean,
  error: ErrorLike | undefined,
  data: GetGamesQuery | undefined
}

/**
 * The GameSession state for entering a game
 */
export type GameSession = {game_id: string, client_type: Client}