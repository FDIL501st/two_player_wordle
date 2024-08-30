import {new_game} from "@games/server";

const NewGameButton = () => {
  // TODO: Redirect to games, while somehow storing new_game result
  function onClick() {
    new_game().then(({game_id, player_type}) => {
      // needs to store game_id and player_type somehow,
      // maybe part of /game url, as search params
      // /game?id={game_id}&player_type={player_type}
    }).catch((e: Error) => {
      alert(e.message)
    })
  }

  return(
    <button onClick={onClick}>
      New Game
    </button>
  )
}

export default NewGameButton