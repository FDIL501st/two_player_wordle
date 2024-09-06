'use client'

import 'client-only'
import {Children} from "@app/types";
import {createContext, useContext, useReducer} from "react";
import {GameSession, NewGameResponse} from "@(game)/types";

type State = GameSession | null

export enum ActionType {
  SET = 'set',
  CLEAR = 'clear'
}

interface Action {
  type: ActionType,
  newGameSession: State
}

export type dispatchFunc = (value: Action) => void

/**
 * The context/state of the gameSession. Can be null.
 */
export const GameSessionContext = createContext<State>(null)
/**
 * The context/state of the dispatch function to update the gameSession context.
 */
export const GameSessionDispatchContext = createContext<dispatchFunc | null>(null)

/**
 * The gameSessionContext setter.
 * This function determines how the GameSession is affected.
 * @param gameSession the gameSession state managed by the client
 * @param action the action requested to occur
 */
function gameSessionReducer(gameSession: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET: {
      // in case of trying to set an undefined GameSession, mimic CLEAR action
      if (!action.newGameSession) {
        return null
      }

      return {
        game_id: action.newGameSession.game_id,
        client_type: action.newGameSession.client_type
      }
    }

    case ActionType.CLEAR: {
      return null
    }

    default:
      throw new Error(`Unknown GameSession Dispatch Action type: ${action.type}`)
  }
}

/**
 Provider of GameSession state and dispatch function to update it.
 GameSession is the game_id and client_type, thus allowing for access to a game.
 */
const GameSessionProvider = ({children}: Children) => {
  const [gameSession, dispatch] = useReducer(gameSessionReducer, null)

  return (
    <GameSessionContext.Provider value={gameSession}>
      <GameSessionDispatchContext.Provider value={dispatch}>
        {children}
      </GameSessionDispatchContext.Provider>
    </GameSessionContext.Provider>
  );
};

export default GameSessionProvider

/**
 * A hook to get the gameSession.
 */
export function useGameSession(): State {
  return useContext<State>(GameSessionContext)
}

/**
 * A hook to get the dispatch function for the gameSession.
 * Expected the dispatch function in the context to not be null.
 */
export function useGameSessionDispatch(): dispatchFunc {
  const dispatch =  useContext<dispatchFunc | null>(GameSessionDispatchContext)

  if (!dispatch) throw new Error("Expected dispatch function to not be null.")

  return dispatch
}

/**
 * Sets the gameSession context variable given the response from new_game from server.
 * @param dispatch the dispatch function from useGameSessionDispatch()
 * @param newGame the result from matchamaking/new_game
 */
export function setGameSession(dispatch: dispatchFunc, newGame: NewGameResponse) {
  dispatch({
    type: ActionType.SET,
    newGameSession: {
      game_id: newGame.game_id,
      client_type: newGame.player_type
    }
  })
}

/**
 * Clears the gameSession,
 * @param dispatch the dispatch function from useGameSessionDispatch()
 */
export function clearGameSession(dispatch: dispatchFunc) {
  dispatch({
    type: ActionType.CLEAR,
    newGameSession: null
  })
}