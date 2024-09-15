import {Action, ActionType} from "@/game/Contexts/GuessProvider"


/**
 * The setter of the Guess context.
 * @param guess the not updated value of guess
 * @param action the update to make to guess
 */
export default function guessReducer(guess: string, action: Action): string {
  switch (action.type) {
    case ActionType.CLEAR: {
      return ""
    }

    case ActionType.BACKSPACE: {
      // can't backspace if guess already is empty
      if (guess.length === 0) return ""

      // returns a new string that doesn't have the last char
      // meaning we remove the last char from guess
      return guess.slice(0, -1)
    }

    case ActionType.ADD: {
      // can't add more letters
      if (guess.length === <number>action.maxWordSize) return guess
      // we are assuming that maxWordSize and letter are provided with ADD
      return guess.concat(<string>action.letter)
    }

    default:
      throw new Error(`Unknown guessDispatch Action type: ${action.type}`)
  }
}
// moved this here as IDE was having parsing troubles with this function
// kept thinking it was a JSX


