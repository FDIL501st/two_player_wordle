'use client'

import {Children} from "@/app/types";
import {setGameSession, useGameSession, useGameSessionDispatch} from "@/(game)/GameSessionProvider";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {new_game} from "@/joining/server";

const JoiningController = ({children}: Children) => {
  const gameSession = useGameSession()
  const dispatch = useGameSessionDispatch()
  const router = useRouter()

  useEffect(() => {
    // if gameSession is set, redirect to /game
    if (gameSession) {
      router.replace('/game')
    }
  }, [gameSession, router]);


  // join a new game
  useEffect(() => {
    // do nothing if gameSession already set
    if (gameSession) return

    async function joinGame() {
      const newGame = await new_game()
      setGameSession(dispatch, newGame)
    }

    // noinspection JSIgnoredPromiseFromCall
    joinGame()

  }, [gameSession, dispatch]);

  if (gameSession) return <></>

  return (
    <>
      {children}
    </>
  );
};


export default JoiningController