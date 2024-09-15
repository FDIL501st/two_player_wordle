'use client'

import {GameSession} from "@/(game)/types";
import {useGameSession} from "@/(game)/GameSessionProvider";
import QuitButton from "@/game/Components/QuitButton";
import {gql} from "@/__generated__";
import {KeyboardEvent} from "react";
import {guessDispatchFn, useGuess, useGuessDispatch} from "@/game/Contexts/GuessProvider";
import {addLetter, removeLetter} from "@/game/Contexts/guessDispatch";
import GuessGrid from "@/game/Components/GuessGrid";

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
  const gameSession: GameSession | null = useGameSession()
  // GameController makes sure gameSession is not null when this component is used

  const guessDispatch: guessDispatchFn = useGuessDispatch()
  const guess: string = useGuess()

  // the size of word being guessed, can be determined by size of
  const wordSize: number = 5
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keyPressed: string = e.key
    console.log(`KeyDown: ${keyPressed}`)
    console.log(`Guess: ${guess}`)
    if (keyPressed === 'Backspace') {
      removeLetter(guessDispatch)
      return
    }

    const lowercaseLetter = /^[a-z]$/;
    if (lowercaseLetter.test(keyPressed)) {
      addLetter(guessDispatch, keyPressed, wordSize)
      return
    }

    // ignore all other keys
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown}>
      Game ID: {gameSession?.game_id}
      <br/>
      Client Type: {gameSession?.client_type}
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