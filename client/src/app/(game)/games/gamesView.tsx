'use client'

import {Game} from "@game/games/types";

interface Games {
  games: Game[]
}

const GamesView = ({games}: Games) => {
  return(
    <div>
      <NewGameButton />
      <Separator />
      {games.map((game) => (
        <div key={game.id}>
          {game.id}
        </div>
      ))}

    </div>
  )
}

export default GamesView


const Separator = () => {
  return(
    <div>
      RUNNING GAMES
    </div>
  )
}

const NewGameButton = () => {
  return(
    <button>
      New Game
    </button>
  )
}

const CurrentGame = ({game}: {game: Game}) => {
  return(
    <div>
      {game.id}
    </div>
  )
}
