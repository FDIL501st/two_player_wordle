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
    <div>
      {rowNumbers.map((rowNumber) => (
        <div key={rowNumber}>
          <GuessRow isActive={currentRow === rowNumber} wordSize={wordSize} guess={guess} />
        </div>
      ))}
    </div>
  );
};

export default GuessGrid

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

  }, [isActive]);

  const letterNumbers: number[] = Array.from({ length: wordSize }, (_, i) => i)

  return (
    <div>
      {letterNumbers.map((letterNumber) => {
        // display no text for boxes without a letter yet
        const letter: string = letterNumber < word.length ? word[letterNumber] : ""

        return (
          <GuessBox letter={letter} />
        )
      })}
    </div>
  )
}

const GuessBox = ({letter}: {letter: string}) => {
  // need to update box colour somehow before updating currentRow
  return(
    <div>
      {letter}
    </div>
  )
}