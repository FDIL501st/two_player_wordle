'use server'

import 'server-only'
import {NewGameResponse} from "@(game)/types";
import {MATCHMAKING_PORT} from "@app/constants";


/** Connects the client to a new game.
 * Returns the game_id of the game the client has joined and which player they are.
 * */
export async function new_game(): Promise<NewGameResponse> {
  // Send a request to matchmaking server to join a new game

  const url: string = `http://localhost:${MATCHMAKING_PORT}/join_game`

  // don't want to cache, want a new game every time from every different client
  let response = await fetch(url, {cache: 'no-store'})

  if (!response.ok) {
    // got an error response
    throw new Error("Had an error occur getting a response from the matchmaking server.")
  }

  let obj: NewGameResponse = await response.json()

  return {
    game_id: obj.game_id,
    player_type: obj.player_type
  }
}
