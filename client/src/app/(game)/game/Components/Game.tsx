'use client'

import mqtt from "mqtt";
import { serialize, deserialize } from "bson";
import QuitButton from "@/game/Components/QuitButton";
import { gql, TypedDocumentNode } from "@apollo/client";
import {KeyboardEvent, useEffect, useRef} from "react";
import GuessGrid from "@/game/Components/GuessGrid";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {add, AddAction, backspace, selectGuess} from "@/lib/features/guess/guessSlice";
import {selectClientType, selectGameID, switch_player} from "@/lib/features/gameSession/gameSessionSlice";
import {Client} from "@/(game)/types";
import {WORD_INDEX_URL} from "@/app/constants";
import {selectCurrentPlayer, selectTargetWord} from "@/lib/features/round/roundSlice";
import {decode_guess_comparison, encode_guess_comparison, LetterState} from "@/app/encoding";
import { GetGameQuery, GetGameQueryVariables, GetRoundQuery, GetRoundQueryVariables } from "@/__generated__/graphql";


const GET_GAME: TypedDocumentNode<GetGameQuery, GetGameQueryVariables> = gql(/* GRAPHQL */`
query GetGame($id: String!) {
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

// same as GET_GAME except no id, so query result won't try to get cache value
const GET_ROUND: TypedDocumentNode<GetRoundQuery, GetRoundQueryVariables> = gql(/* GRAPHQL */`
query GetRound($id: String!) {
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

/**
 * The logic of the Game. 
 * This means handling keyboard input, updating internal state with guesses made, 
 * communicating with the server to update the game state in the database 
 * and get updates on the opponent's guesses through mqtt.
 * 
 * Contins the components of what the game board has.
 * This includes the guess grid and the quit button.
 */
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


  // MQTT connection clinet
  const mqttclientRef = useRef<mqtt.MqttClient | null>(null)

  // initialize MQTT connection in useEffect, 
  // so that connection is only made once when component mounts, 
  // and properly closed when component unmounts
  useEffect(() => {
    // expect gameID to be defined, since GameController should ensure that before rendering Game component
    if (!gameID) {
      console.error("gameID should be defined at this point, but is not. This is an unexpected state and likely indicates a bug in the code. Please investigate.")
      return
    }

    const mqttclient = mqtt.connect("ws://localhost:15675/ws", {
      username: "guest",
      password: "guest",
      // RabbitMQ requires a clientId
      clientId: "browser-" + Math.random().toString(16).slice(2),
      reconnectPeriod: 1000, // try to reconnect every 1 second
      connectTimeout: 30000, // 30 seconds timeout for initial connection
    })
    mqttclientRef.current = mqttclient

    // TODO: Fix logic below, just log messages, don't do anything now

    const topic = `game/${gameID}/guesses`

    mqttclient.on("connect", () => {
      console.log("connected to MQTT broker")

      // also subscribe to the topic to receive messages after connection is established
      mqttclient.subscribe(topic, { qos: 1 }, (err) => {
        // qos 1 means we can get duplicate messages, but won't lose messages.
        // to counter duplicate messages, we add round number, so client can recognize if message is duplicate or not 
        if (err) {
          console.error("subscribe error", err)
        } else {
          console.log(`subscribed to ${topic}`)
        }
      })
    })

    mqttclient.on("error", (err) => {
      console.error("connection error", err)
    })

    mqttclient.on("message", (topic, payload) => {
      // payload is a Buffer, convert to Uint8Array for BSON deserialization
      const data = deserialize(new Uint8Array(payload))
      console.log(`Received message on topic "${topic}":`, data)

      // we expeect data to have following fields:
      // guessedWord: string
      // letterState: LetterState[]
      // roundNum: number
      // player: Client

      // TODO: use this data to update the game state in redux, which will then update the UI accordingly
      // need some sort of redux for turns     

    })

    return () => {
      mqttclient.end()
    }

    }, [gameID]) // only re-run effect if gameID changes, which shouldn't happen since gameID is fixed for a game session

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
