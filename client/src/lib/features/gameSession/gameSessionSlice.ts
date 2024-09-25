import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from "@/lib/store";
import {Client} from "@/(game)/types";

type gameID = string

interface GameSession {
  game_id?: gameID,
  client_type: Client
}


interface GameSessionState {
  value: GameSession
}

const initialGameSession: GameSessionState = {
  value: { game_id: undefined, client_type: Client.Spectator}
}

export const gameSessionSlice = createSlice({
  name: 'guessSession',
  initialState: initialGameSession,
  reducers: {
    reset: _ => {
      return initialGameSession
    },
    set: (state, action: PayloadAction<GameSession>) => {
      const game_id = action.payload.game_id
      state.value = {
        game_id,
        client_type: game_id ? action.payload.client_type : Client.Spectator
      }
      // if no game_id given, ignore the client_type and set it to Spectator,
      // which is a view only client type
    }
  }
})

export const {
  reset,
  set
} = gameSessionSlice.actions

export const selectGameID = (state: RootState) => <gameID | undefined>state.gameSession.value.game_id
export const selectClientType = (state: RootState) => <Client>state.gameSession.value.client_type

export default gameSessionSlice.reducer