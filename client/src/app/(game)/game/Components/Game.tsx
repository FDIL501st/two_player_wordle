'use client'

import QuitButton from "@/game/Components/QuitButton";
import {gql} from "@/__generated__";
import {KeyboardEvent} from "react";
import GuessGrid from "@/game/Components/GuessGrid";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {add, AddAction, backspace} from "@/lib/features/guess/guessSlice";
import {selectClientType, selectGameID} from "@/lib/features/gameSession/gameSessionSlice";
import {Client} from "@/(game)/types";

const GET_GAME = gql(/* GRAPHQL */`
query GET_GAME($id: String!) {
  game(id: $id) {
    id
    p1Points
    p2Points
    roundNum
    currentRound {
      letterpoolState
      currentPlayer
      guessNum
      turns {
        guessedWord
        letterState
      }
    }
  }
}
`)

const Game = () => {
  // GameController makes sure gameID is not undefined when this component is used
  const gameID = useAppSelector(selectGameID)

  const client_type = useAppSelector(selectClientType)
  const dispatch = useAppDispatch()

  // the size of word being guessed,
  // can be determined by size of word to guess (another server that figures this out)
  const wordSize: number = 5
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Spectators are view only, can't affect page
    // if (client_type === Client.Spectator) return

    const keyPressed: string = e.key
    console.log(`KeyDown: ${keyPressed}`)
    
    if (keyPressed === 'Backspace') {
      dispatch(backspace())
      return
    }

    const lowercaseLetter = /^[a-z]$/;
    if (lowercaseLetter.test(keyPressed)) {
      const addAction: AddAction = {
        letter: keyPressed,
        maxWordSize: wordSize
      }
      dispatch(add(addAction))
      return
    }

    // ignore all other keys
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown}>
      Game ID: {gameID}
      <br/>
      Client Type: {client_type}
      <hr/>
      <QuitButton />
      <hr/>
      <div className={"m-4 bg-blue-100"}>
        <GuessGrid />
      </div>

    </div>
  );
};

export default Game