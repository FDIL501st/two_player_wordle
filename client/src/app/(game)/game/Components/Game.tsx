'use client'

import QuitButton from "@/game/Components/QuitButton";
import {gql} from "@/__generated__";
import {KeyboardEvent, useEffect} from "react";
import GuessGrid from "@/game/Components/GuessGrid";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {add, AddAction, backspace, selectGuess} from "@/lib/features/guess/guessSlice";
import {selectClientType, selectGameID, switch_player} from "@/lib/features/gameSession/gameSessionSlice";
import {Client} from "@/(game)/types";
import {WORD_INDEX_URL} from "@/app/constants";
import {selectCurrentPlayer, selectTargetWord} from "@/lib/features/round/roundSlice";
import {decode_guess_comparison, encode_guess_comparison, LetterState} from "@/app/encoding";

const GET_GAME = gql(/* GRAPHQL */`
query GET_GAME($id: String!) {
  game(id: $id) {
    id
    p1Points
    p2Points
    roundNum
    currentRound {
      targetWord
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

// same as GET_GAME
const GET_ROUND = gql(/* GRAPHQL */`
query GET_GAME($id: String!) {
  game(id: $id) {
    p1Points
    p2Points
    roundNum
    currentRound {
      targetWord
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
  const current_player = useAppSelector(selectCurrentPlayer)
  const target_word = useAppSelector(selectTargetWord)
  const guess: string = useAppSelector(selectGuess)
  const dispatch = useAppDispatch()
  
  // the size of word being guessed,
  // can be determined by size of word to guess (another server that figures this out)
  const wordSize: number = 5

  useEffect(() => {
    // update grid per turn

    // wait for some sort of http request which is blocked until db updates
    // when http GET request returns, update redux and grid and start next turn
  })

  // function to run when making a guess
  async function make_guess(word: string) {
	  // first check if its a valid word
    const url_path: string = `/check/isValid?word=${word}`
    const isValid = await fetch(WORD_INDEX_URL + url_path)

    // invalid word, don't go to next round,
    if (!isValid) {

      // throw an error instead of return?
      // or have int return as code for where return from
      return 1
    }
    // compare word to target
    const comparison_result_encoded = encode_guess_comparison(word, target_word)
    const comparison_result = decode_guess_comparison(comparison_result_encoded)


    // and call update to round in graphql_server


    // and change players (redux call to currentPlayer)

    // guessed correctly
    if (comparison_result === new Array(comparison_result.length).fill(LetterState.GREEN)) {

      return 2
    }

    return 0
  }
  async function pressEnter() {
    const status = await make_guess(guess).catch((_): -1 => {
      return -1
    })
    if (status == -1) {
      // handle error?
    }
    if (status === 1) {
      // Notify user they input an invalid word
    }
    // know for sure that we written to db, now we need to

    if (status === 0) {
      // http request sending a signal of updated db?
    }
    if (status === 2) {
      // also need to end round and communicate that somehow to other player
    }
    // what if last round?
    // then also need to start new round (or if this is last round end game?)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {

    // Only current player, can affect page
    // if (client_type !== current_player) return

    const keyPressed: string = e.key
    console.log(`KeyDown: ${keyPressed}`)

    if (keyPressed === 'Enter' && guess.length === wordSize) {
      pressEnter().then(() => {
      })
    }

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
    // supposedly -1 tabindex means keyboard focus on it, but not able to get to focus on it with tab
    <div tabIndex={-1} onKeyDown={handleKeyDown}>
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

export default Game;
