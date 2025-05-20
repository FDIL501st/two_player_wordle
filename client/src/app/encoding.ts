import {ArgumentError} from '@/app/errors'

export enum LetterState {
  WHITE = 0,
  YELLOW = 1,
  GREEN = 2,
  BLACK = 3,
}

/** when doing comparisons between 2 words, letters can have 3 following results:
 * Unused bits: 0b00 (0)
 * Yellow (letter in word, but incorrect spot): 0b01 (1)
 * Green (letter in correct spot): 0b10 (2)
 * Black (letter not in word): 0b11 (3)
 */

export function encode_guess_comparison(guess_word: string, target_word: string): number {
  const word_length = guess_word.length
  if (word_length != target_word.length) {
    throw new ArgumentError("Words to compare must have same length.", )
  }
  if (guess_word.length > 8) {
    throw new ArgumentError("Can't encode comparisons for more than 8 letters.")
  }

  const encoded_bytes = new Uint16Array(1)
  encoded_bytes[0] = 0

  // make a deep copy of target_word to track letters we have not guessed/found yet
  const not_found_letters: Array<string> = Array.from(target_word)
  // can't use a set as word might have duplicate letters (we can't ignore duplicated)
  
  // variable to track indexed not encoded
  const index_not_encoded: Set<number> = new Set(Array.from({ length: word_length }, (_, i) => i))

  // first check for any green letters

  // this variable is needed as everytime we remove a char from not_found_letters,
  // all chars after have their index be 1 less than before
  let num_removed = 0
  for (let i = 0; i < word_length; i++) {
    const guess_letter = guess_word.charAt(i)
    const target_letter = target_word.charAt(i)

    if (guess_letter === target_letter) {
      // insert green encoded bytes at correct position
      encoded_bytes[0] |= (LetterState.GREEN.valueOf() << (2 * i))

      // remove found letter from not_found
      not_found_letters.splice(i-num_removed, 1)
      num_removed++
      index_not_encoded.delete(i)
    }
  }

  // now we look over all indexes not encoded and check if those guess letters are in not_found (yellow) or not (black)

  for (const i of index_not_encoded) {
    const guess_letter = guess_word.charAt(i)
    let encoded_bits = 0b00   // temp value, will update later

    // note: can no longer rely on i-num_removed to get correct index from not_found_letters
    // it worked before as we were checking sequentially, start to end
    const found_letter_index = not_found_letters.indexOf(guess_letter)
    if (found_letter_index === -1) {
      // letter not found, encode black
      encoded_bits = LetterState.BLACK.valueOf()
    } else {
      // letter found, encode yellow
      encoded_bits = LetterState.YELLOW.valueOf()
      not_found_letters.splice(found_letter_index, 1)
    }
    encoded_bytes[0] |= (encoded_bits << (2 * i))
  }

  return encoded_bytes[0]
}

export function decode_guess_comparison(encoded_number: number): LetterState[] {
  let letter_states: LetterState[] = []

  // make a copy to do bitwise operations with
  let encoded = encoded_number
  while (true) {
    // get least 2 significant bits
    const least_two_bits = (encoded & 0b11)

    // leave condition is when least_two_bits is 0
    if (least_two_bits === 0) break

    letter_states.push(least_two_bits as LetterState)

    // update encoded by shifting it to right by 2 bits,
    // this moves our least two significant bits out, and moves in next least significant in
    encoded = encoded >>> 2
    // note: >>> is >> but assumes unsigned numbers, so adds 0 to right always
    // >> can possibly add a 1 if number has a leading 1 (so negative number stay negative after operation)
    // useful for math, not when dealing with bytes that aren't numbers
  }

  return letter_states
}

/**
 * When encoding/decoding letterpool state, 0b00 now has meaning. It means unused letters
 * 0b00 no longer has to be used as a stopping condition (unlike with guess) as we for sure know
 * length of letter_states is 26 (there are 26 letters in alphabet)
 */

export function encode_letterpool(letter_states: LetterState[]): bigint {
  // have to use BigInt as number ends up overflow with 56 bits (26 letters x 2 bits per letter)

  let encoded = BigInt(0)

  // to do opposite of decode, we start from end of array
  for (let i = letter_states.length-1; i >= 0; i--) {
    const letter_state_num = BigInt(letter_states[i].valueOf())

    // make space for letter_state_num
    encoded = encoded << BigInt(2)
    // copy bits over as least 2 significant bits
    encoded = (encoded | letter_state_num)
  }
  return encoded
}

export function decode_letterpool(encoded_int: bigint): LetterState[] {
  const NUM_LETTERS = 26
  const letterpool_states: LetterState[] = new Array<LetterState>(NUM_LETTERS).fill(LetterState.WHITE)

  let encoded: bigint = encoded_int // make a copy to edit
  for (let i = 0; i < NUM_LETTERS; i++) {
    // read least 2 significant bit, put into array, then move to next 2
    const least_two_bits = encoded & BigInt(0b11)
    letterpool_states[i] = Number(least_two_bits) as LetterState

    // we don't care if we add 1 to right hand side as we won't ever read the new bits we add
    encoded = encoded >> BigInt(2)
  }

  return letterpool_states
}