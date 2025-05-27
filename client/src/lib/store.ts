import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "@/lib/features/counter/counterSlice"
import guessReducer from "@/lib/features/guess/guessSlice"
import gameSessionReducer from "@/lib/features/gameSession/gameSessionSlice"
import roundReducer from "@/lib/features/round/roundSlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      guess: guessReducer,
      gameSession: gameSessionReducer,
      round: roundReducer,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']