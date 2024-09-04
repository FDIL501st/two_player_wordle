'use client'

import {Children} from "@app/types";
import {useEffect} from "react";
import {
  ActionType,
  dispatchFunc,
  useGameSession, useGameSessionDispatch
} from "@(game)/GameSessionProvider";
import {GameSession, NewGameResponse} from "@(game)/types";
import {new_game} from "@game/server";

const GameController = ({children}: Children) => {
  const gameSession: GameSession | null = useGameSession()
  const dispatch: dispatchFunc = useGameSessionDispatch()

  // if gameSession is null, then client is not part/joined a game.
  // This means got here waiting to join a new game.

  useEffect(() => {
    async function join_game()  {
      if (gameSession) {
        // do nothing if gameSession already has a value
        return
      }

      // join a new game
      const newGame: NewGameResponse = await new_game()
      // possible error can be thrown if graphql query was unable to be executed
      // meaning an 500 internal error

      dispatch({
        type: ActionType.SET,
        newGameSession: {
          game_id: newGame.game_id,
          client_type: newGame.player_type
        }
      })

    }

    join_game()
    // join_game will only be a server action if we don't use the .then() or .catch()

  }, [gameSession, dispatch]);

  if (!gameSession) return <JoiningGame />

  return(
    <>
      {children}
    </>
  )
}

/**
 * Component shown when waiting to join a game/when gameSession is not set.
 */
const JoiningGame = () => {
  // can't make this a server component as this component will always be part of a client component
  // reason is can't do conditional rendering of this without it being part of a client component
  return (
    <h1>JOINING A GAME</h1>
  );
};

export default GameController