/**
 * Has a provider for the GuessContext.
 * This stores the current guess, as the player makes it.
 */

'use client'

import {useReducer, useContext, createContext} from "react";
import {Children} from "@/app/types";
import guessReducer from "@/game/Contexts/guessReducer";


export enum ActionType {
  BACKSPACE ,
  ADD,
  CLEAR
}

// The action sent as an argument for the dispatch function
export interface Action {
  // the type of action for the reducer function
  type: ActionType,
  // for an ADD, the letter guessed
  letter?: string,
  // for an ADD, the max wordSize of guess
  maxWordSize?: number
}

export type guessDispatchFn = (value: Action) => void

// The current state of the guess the player has made.
// Doesn't have to be a full word, this tracks each letter guessed as they are made.
const GuessContext = createContext<string>("")

// the dispatch function that is used to update the guess Context.
const GuessDispatchContext = createContext<guessDispatchFn | null>(null)


function initFn(): any {
  // must return any to work within useReducer
  return ""
}

const GuessProvider = ({children}: Children) => {
  const [guess, dispatch] = useReducer(guessReducer, "", initFn)

  return(
    <GuessContext.Provider value={guess}>
      <GuessDispatchContext.Provider value={dispatch}>
        {children}
      </GuessDispatchContext.Provider>
    </GuessContext.Provider>
  )
}

export default GuessProvider


// Hook to get the guess.
export function useGuess(): string {
  return useContext<string>(GuessContext)
}

// Hook to get the guess dispatch function.
// Expects it to not be null.
export function useGuessDispatch(): guessDispatchFn {
  const dispatch =  useContext<guessDispatchFn | null>(GuessDispatchContext)

  if (!dispatch) throw new Error("Expected dispatch function to not be null.")

  return dispatch
}
