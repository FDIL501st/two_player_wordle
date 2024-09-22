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
    clear: _ => {
      return initialGameSession
    },
    set: (state, action: PayloadAction<GameSession>) => {
      const game_id = action.payload.game_id
      state.value = {
        game_id,
        client_type: game_id ? action.payload.game_id : Client.Spectator
      }
    }
  }
})

export const {
  clear,
  set
} = gameSessionSlice.actions

export const selectGameID = (state: RootState) => <gameID | undefined>state.gameSession.value.game_id
export const selectGameClient = (state: RootState) => <Client>state.gameSession.value.client_type

export default gameSessionSlice.reducer