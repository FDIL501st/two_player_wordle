'use client'

import {Children} from "@/app/types";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {new_game} from "@/joining/server";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {selectGameID, set} from "@/lib/features/gameSession/gameSessionSlice";

const JoiningController = ({children}: Children) => {
  const dispatch = useAppDispatch()
  const gameID = useAppSelector(selectGameID)
  const router = useRouter()

  useEffect(() => {
    // if gameID is set, redirect to /game
    if (gameID) {
      router.replace('/game')
    }
  }, [gameID, router]);


  // join a new game
  useEffect(() => {
    // do nothing if gameSession already set
    if (gameID) return

    async function joinGame() {
      const newGame = await new_game()
      dispatch(set({
        game_id: newGame.game_id,
        client_type: newGame.player_type
      }))

      // also need to set new round
    }

    // noinspection JSIgnoredPromiseFromCall
    joinGame()

  }, [gameID, dispatch]);

  if (gameID) return <></>

  return (
    <>
      {children}
    </>
  );
};


export default JoiningController