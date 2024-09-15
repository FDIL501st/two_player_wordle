import {ActionType, guessDispatchFn} from "@/game/Contexts/GuessProvider";

/**
 * This file has functions that this app will use for calling guessDispatch.
 * Using these functions ensure proper usage of guessDispatch function.
 */

/**
 * Dispatch for adding a letter to guess.
 * @param dispatch the guessDispatch function
 * @param letter the letter to add to guess
 * @param maxWordSize the max number of letter guess can have
 */
export function addLetter(dispatch: guessDispatchFn, letter: string, maxWordSize: number) {
  dispatch({
    type: ActionType.ADD,
    letter: letter,
    maxWordSize: maxWordSize
  })
}

/**
 * Dispatch for clearing guess.
 * @param dispatch the guessDispatch function
 */
export function clearGuess(dispatch: guessDispatchFn) {
  dispatch({
    type: ActionType.CLEAR
  })
}

/**
 * Dispatch for removing last letter from guess.
 * @param dispatch the guessDispatch function
 */
export function removeLetter(dispatch: guessDispatchFn) {
  dispatch({
    type: ActionType.BACKSPACE
  })
}
