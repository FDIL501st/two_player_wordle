'use client'

import QuitButton from "@/game/Components/QuitButton";
import {gql} from "@/__generated__";
import {KeyboardEvent} from "react";
import GuessGrid from "@/game/Components/GuessGrid";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {add, AddAction, backspace, selectGuess} from "@/lib/features/guess/guessSlice";
import {selectClientType, selectGameID} from "@/lib/features/gameSession/gameSessionSlice";

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
  const gameID = useAppSelector(selectGameID)
  // GameController makes sure gameID is not undefined when this component is used

  const client_type = useAppSelector(selectClientType)


  const dispatch = useAppDispatch()
  const guess = useAppSelector(selectGuess)

  // the size of word being guessed, can be determined by size of
  const wordSize: number = 5
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keyPressed: string = e.key
    console.log(`KeyDown: ${keyPressed}`)
    console.log(`Guess: ${guess}`)
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

      <h1>{guess}</h1>

      <hr/>
      <QuitButton />
      <hr/>
      <GuessGrid />
    </div>
  );
};

export default Game