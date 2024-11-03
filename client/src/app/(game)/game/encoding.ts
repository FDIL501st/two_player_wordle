import {ArgumentError} from '@/app/errors'

/** when doing comparisons between 2 words, letters can have 3 following results:
 * Green (letter in correct spot): 0b11 (3)
 * Yellow (letter in word, but incorrect spot): 0b10 (2)
 * Black (letter not in word): 0b01 (1)
 * Unused bits: 0b00 (0)
 */

export function encode_guess_comparison(guess_word: string, target_word: string): Uint16Array {

  if (guess_word.length != target_word.length) {
    throw new ArgumentError("Words to compare must have same length.", )
  }
  if (guess_word.length > 8) {
    throw new ArgumentError("Can't encode differences for more than 8 letters.")
  }

  const encoded_bytes = new Uint16Array(1)
  encoded_bytes[0] = 0

  // make a (deep) copy of target_word
  let not_found_letters = Array.from(target_word)

  for (let i = 0; i < target_word.length; i++) {
    let encoded_bits = 0b11

    const guess_letter = guess_word.charAt(i)
    if (guess_letter === target_word.charAt(i)) {
      encoded_bytes[0] |= (encoded_bits << (2 * i))
      // remove letter from not_found letters
      not_found_letters.splice(i, 1)
      continue
    }
    // letters don't match, check if its in not_found letters
    const possible_not_found_letter_index = not_found_letters.indexOf(guess_letter)
    if (possible_not_found_letter_index !== -1) {
      encoded_bits = 0b10
      // remove letter from not_found letters
      not_found_letters.splice(possible_not_found_letter_index, 1)
    } else {
      encoded_bits = 0b01
    }
    encoded_bytes[0] |= (encoded_bits << (2 * i))
  }

  return encoded_bytes
}

export enum LetterState {
  BLACK = 1,
  YELLOW = 2,
  GREEN = 3
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
  }

  return letter_states
}