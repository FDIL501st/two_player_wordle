'use client'

import {useState} from "react";

const GuessGrid = () => {
  const [currentRow, setCurrentRow] = useState<number>(0)
  // the total number of guesses/rows
  const numGuesses: number = 5
  const rowNumbers: number[] = Array.from({ length: numGuesses }, (_, i) => i);
  // row numbers/indexes start from 0

  // number of letters word being guessed are
  const wordSize: number = 5

  return (
    <div>
      {rowNumbers.map((rowNumber) => (
        <div key={rowNumber}>
          <GuessRow isActive={currentRow === rowNumber} wordSize={wordSize}/>
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
  wordSize: number
}
const GuessRow = ({isActive, wordSize}: GuessRowProps) => {
  return (
    <></>
  )
}