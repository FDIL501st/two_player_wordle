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
    // resets gameSession
    reset: _ => {
      return initialGameSession
    },
    // sets the gameSession, main use is when first joining a game
    set: (state, action: PayloadAction<GameSession>) => {
      const game_id = action.payload.game_id
      state.value = {
        game_id,
        client_type: game_id ? action.payload.client_type : Client.Spectator
      }
      // if no game_id given, ignore the client_type and set it to Spectator,
      // which is a view only client type
    },
    // switches the current player, P1 -> P2 or P2 -> P1
    switch_player: (state) => {

    }
  }
})

export const {
  reset,
  set,
  switch_player
} = gameSessionSlice.actions

export const selectGameID = (state: RootState) => <gameID | undefined>state.gameSession.value.game_id
export const selectClientType = (state: RootState) => <Client>state.gameSession.value.client_type

export default gameSessionSlice.reducer