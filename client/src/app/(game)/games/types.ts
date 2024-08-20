/*
Defines types used within /games route
 */

/*
The type of client/player communicating with the game.
Spectator, P1 (player 1) or P2 (player 2).
 */
enum Player {
  Spectator = "Spectator",
  P1 = "P1",
  P2 = "P2"
}

export type NewGameResponse = {game_id: string, player_type: Player}

interface Game {
  id: string
}

export {
  type Game
}