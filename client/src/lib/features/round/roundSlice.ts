import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '@/lib/store'
import {Client} from '@/(game)/types'
import {LetterState} from "@/app/encoding";

type Player = Client

// should match Round model stored in database/graphql server
export interface RoundState {
  turns: Turn[]

  // The state of all the letters in the round.
  letterpool_state: LetterState[]

  // The current guess number the round is on.
  // Guess number starts at 0.
  guess_num: number

  // The current player whose turn it is.
  current_player: Player,

  // The target word that players are trying to guess for the round.
  target_word: string,
}

export interface Turn {
  // The word guessed by the player.
  guessed_word: String,

  // the states of each letter of the word.
  letter_state: LetterState[]
}

const initialRoundState: RoundState = {
  turns: [] as Turn[],
  letterpool_state: [],
  guess_num: 0,
  current_player: Client.Spectator,
  target_word: '',
}

export type TurnMade = {
  skip_guess: boolean
  turn: Turn,
  letterpool_state: LetterState[],
}

export const roundSlice = createSlice({
  name: 'round',
  initialState: initialRoundState,
  reducers: {
    // clears round value to initial state, which is for when not in a round
    clear_round: (state) => {
      return initialRoundState
    },

    // starts a new round
    new_round: (state, action: PayloadAction<{target_word: string, start_player: Player}>) => {
      return {
        turns: [] as Turn[],
        guess_num: 0,
        current_player: action.payload.start_player,
        target_word: action.payload.target_word,
        letterpool_state: new Array(26).fill(LetterState.WHITE)
        // all 26 letters are White (unused)
      }
    },

    // start next_turn
    next_turn: (state, action: PayloadAction<TurnMade>) => {
      // change player
      if (state.current_player === Client.P1) {
        state.current_player = Client.P2
      }
      else if (state.current_player === Client.P2) {
        state.current_player = Client.P1
      }

      // skip the guess (due to timeout)
      if (action.payload.skip_guess) {
        return
        // nothing else gets updated
      }

      state.guess_num += 1
      state.turns.push(action.payload.turn)
      state.letterpool_state = action.payload.letterpool_state
    }
  }
})

export const {
  clear_round,
  new_round,
  next_turn
} = roundSlice.actions


export const selectTargetWord = (state: RootState) => state.round.target_word
export const selectCurrentPlayer = (state: RootState) => state.round.current_player

export default roundSlice.reducer
