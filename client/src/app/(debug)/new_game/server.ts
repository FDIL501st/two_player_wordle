

import {Game, Player} from "@debug/new_game/types";

// need to get this value from an env variable
const MATCHMAKING_PORT = 10001

// define this const string outside the function as to keep this var alive at all times
// thus only need to construct once
const url: string = `http://localhost:${MATCHMAKING_PORT}/join_game`

// Makes a request to the matchmaking server to join a new game
async function create_newGame(): Promise<Game> {
    // don't want to cache, want a new game every time from every different client
    let response = await fetch(url, {cache: 'no-store'})

    if (!response.ok) {
        // got an error response
        throw new Error("Had an error occur getting a response from the matchmaking server.")
    }
    let obj: Game = await response.json()

    return {
        game_id: obj.game_id,
        player_type: obj.player_type
    }
    // can only pass along js plain objects (not classes) from server to client components
}

export default create_newGame