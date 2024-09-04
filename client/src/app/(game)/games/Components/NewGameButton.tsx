import {CLIENT_PORT} from "@app/constants";
import Link from "next/link";

const NewGameButton = () => {
  return(
    <Link href={`/game`}>
      New Game
    </Link>
  )
}

export default NewGameButton