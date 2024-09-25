'use client'

import {Children} from "@/app/types";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {useAppSelector} from "@/lib/hooks";
import {selectGameID} from "@/lib/features/gameSession/gameSessionSlice";

const GameController = ({children}: Children) => {
  const router = useRouter()
  const gameID = useAppSelector(selectGameID)

  useEffect(() => {
    // should only really reach this page if gameID is not null
    if (!gameID) {
      router.replace("/games")
    }
  }, [gameID, router]);

  // render nothing if gameSession is not set
  if (!gameID) return <></>

  return(
    <>
      {children}
    </>
  )
}

export default GameController