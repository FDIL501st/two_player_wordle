'use client'

import {useEffect, useState} from "react";
import {useAppSelector} from "@/lib/hooks";
import {selectGuess} from "@/lib/features/guess/guessSlice";

const GuessGrid = () => {
  const [currentRow, setCurrentRow] = useState<number>(0)
  // the total number of guesses/rows
  const numGuesses: number = 6
  const rowNumbers: number[] = Array.from({ length: numGuesses }, (_, i) => i);
  // row numbers/indexes start from 0

  // number of letters word being guessed are
  const wordSize: number = 5

  // the guess
  const guess: string = useAppSelector(selectGuess)

  return (
    <div className={"p-1"}>
      {rowNumbers.map((rowNumber) => (
        <div key={rowNumber} className={"my-4"}>
          <GuessRow isActive={currentRow === rowNumber} wordSize={wordSize} guess={guess} />
        </div>
      ))}
    </div>
  );
};

export default GuessGrid

enum BoxColours {
  WHITE = "bg-white",
  GRAY = "bg-grey-400",
  GREEN = "bg-green-500",
  YELLOW = "bg-amber-300"
}

/**
 * Notes:
 *
 * Store guesses an array of 5 letters
 * Guess grid controls which row is active
 */

interface GuessRowProps {
  isActive: boolean,
  wordSize: number,
  guess: string
}
const GuessRow = ({isActive, wordSize, guess}: GuessRowProps) => {
  // the word/guess being displayed by this row
  const [word, setWord] = useState<string>("")

  useEffect(() => {
    // do nothing if current row is not active
    if (!isActive) return

    // update word everytime guess is updated
    setWord(guess)

  }, [isActive, guess]);

  const letterNumbers: number[] = Array.from({ length: wordSize }, (_, i) => i)

  // need to update box colour somehow before updating currentRow/changing rows
  const initialBoxColours: BoxColours[] = Array.from({ length: wordSize }, () => BoxColours.WHITE)
  const [colour, setColour] = useState<Array<BoxColours>>(initialBoxColours)

  return (
    <div className={`grid grid-flow-col auto-cols-auto gap-1 justify-center`}>
      {letterNumbers.map((letterNumber) => {
        // display no text for boxes without a letter yet
        const letter: string = letterNumber < word.length ? word[letterNumber] : ""

        return (
          <div key={letterNumber}
               className={`aspect-square w-[25px] sm:w-[50px] md:w-[100px] lg:w-[150px]
               border rounded border-black ${colour[letterNumber].valueOf()}
               text-black text-center place-content-center 
               text-base sm:text-xl md:text-3xl lg:text-4xl
               before:content-[''] before:inline before:h-full before:w-full`}>
            {/* issue when I try to use percentage for width is auto width becomes essentially 0,
            thus our box becomes 0x0. Need a given size, that isn't relative.
             */}
            <GuessBox letter={letter} />
          </div>
        )
      })}
    </div>
  )
}

const GuessBox = ({letter}: {letter: string}) => {
  return(
    <>
      {letter}
    </>
  )
}