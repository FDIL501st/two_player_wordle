import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from "@/lib/store";

type guessValue = string

export interface AddAction {
  // the letter guessed
  letter: guessValue,
  // the max wordSize of guess
  maxWordSize: number
}

export interface GuessState {
  value: guessValue
}

const initialGuessState: GuessState = {
  value: ""
}

export const guessSlice = createSlice({
  name: 'guess',
  initialState: initialGuessState,
  reducers: {
    clear: state => {
      state.value = ""
    },
    backspace: state => {
      // can't backspace if guess already is empty
      if (state.value.length === 0) return

      state.value = state.value.slice(0, -1)
    },
    add: (state, action: PayloadAction<AddAction>) => {
      // can't add more letters
      if (state.value.length === action.payload.maxWordSize) return

      // we are assuming that maxWordSize and letter are provided with ADD
      state.value += action.payload.letter
    }
  }
})

export const {
  clear,
  backspace,
  add
} = guessSlice.actions

export const selectGuess = (state: RootState) => <guessValue>state.guess.value
// add type assertion as by default state.guess.value is any

export default guessSlice.reducer