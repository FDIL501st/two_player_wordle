/*
Defines types used within /games route
 */

import {GetGamesQueryResult} from "@/__generated__/graphql";

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
