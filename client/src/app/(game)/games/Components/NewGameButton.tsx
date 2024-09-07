import Link from "next/link";

const NewGameButton = () => {
  return(
    <Link className={"btn btn-blue"} href={`/joining`}>
      New Game
    </Link>
  )
}

export default NewGameButton