

import {ActionType, useGameSessionDispatch} from "@(game)/GameSessionProvider";

const QuitButton = () => {
  const dispatch = useGameSessionDispatch()

  return (
    <button onClick={() => dispatch({type: ActionType.CLEAR, newGameSession: null})}>
      Quit Game
    </button>
  );
};

export default QuitButton