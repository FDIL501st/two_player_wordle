'use client'

import {useEffect, useState} from "react";
import {Game, NewGameResponse} from "@debug/new_game/types";
import create_newGame from "@debug/new_game/server";

export default function NewGame() {

    const [game, setGame] = useState(new NewGameResponse())
    function get_new_game() {
        create_newGame().then((jsonResponse: Game) => {
            setGame(NewGameResponse.from_json(jsonResponse))
        }).catch((e: Error) => {
            console.error(e.message)
            // alert("Error occurred.")
        })
    }

  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(n => n+1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div>
                2 player wordle client new game connection
            </div>
            <div>
              Counter: {counter}
            </div>
            {/*<NewGameButton setGameID={setGameID} setPlayer={setPlayer} />*/}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={get_new_game}
            >
                Join a new game
            </button>
            <div>
                gameID: {game.game_id}
                <br/>
                player: {game.player_type}
            </div>
        </main>
    );
}