'use client'

import {Children} from "@app/types";
import {useGameSession} from "@(game)/GameSessionProvider";
import {GameSession} from "@(game)/types";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const GameController = ({children}: Children) => {
  const router = useRouter()
  const gameSession: GameSession | null = useGameSession()

  useEffect(() => {
    // should only really reach this page if gameSession is not null
    if (!gameSession) {
      router.replace("/games")
    }
  }, [gameSession, router]);

  if (!gameSession) return <></>

  return(
    <>
      {children}
    </>
  )
}

export default GameController