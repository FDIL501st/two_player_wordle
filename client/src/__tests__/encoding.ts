import {describe, expect, jest, test} from '@jest/globals';
import {encode_guess_comparison, decode_guess_comparison, LetterState} from "@/game/encoding";

describe('All Tests in encoding.ts', () => {
  describe('Encoding Tests', () => {
    test('word match', () => {
      const word = "words"
      const actual = encode_guess_comparison(word, word)[0]
      const expected = 0b00_00_00_11_11_11_11_11
      expect(actual).toBe(expected)
    })

    test('word total mismatch', () => {
      const target = "words"
      const guess = "aaaaa"
      const actual = encode_guess_comparison(guess, target)[0]
      const expected = 0b00_00_00_01_01_01_01_01
      expect(actual).toBe(expected)
    })
    test ('word partial match and no duplicate letters', () => {
      const target = "squat"
      const guess = "straw"
      const actual = encode_guess_comparison(guess, target)[0]
      const expected = 0b00_00_00_01_11_01_10_11
      expect(actual).toBe(expected)
    })

    test('word partial match and guess has less duplicates than target', () => {
      const target = "falls"
      const guess = "longs"
      const actual = encode_guess_comparison(guess, target)[0]
      const expected = 0b00_00_00_11_01_01_01_10
      expect(actual).toBe(expected)
    })

    test('word partial match and guess has more duplicates than target', () => {
      const target = "pzazz"
      const guess = "pizza"
      const actual = encode_guess_comparison(guess, target)[0]
      const expected = 0b00_00_00_10_11_10_01_11
      expect(actual).toBe(expected)
    })
  });

  describe('Decoding Tests', () => {
    test('Decode empty', () => {
      const encoded = 0
      const actual = decode_guess_comparison(encoded)
      const expected = [] as LetterState[]

      expect(actual).toEqual(expected)
    })

    test('Decode five comparisons', () => {
      const encoded = 0b00_00_00_10_11_10_01_11
      const actual = decode_guess_comparison(encoded)
      const expected: LetterState[] = [
        LetterState.GREEN, LetterState.BLACK, LetterState.YELLOW, LetterState.GREEN, LetterState.YELLOW
      ]

      expect(actual).toEqual(expected)
    })

    test('Decode eight comparisons', () => {
      const encoded = 0b01_01_11_10_11_10_01_11
      const actual = decode_guess_comparison(encoded)
      const expected: LetterState[] = [
        LetterState.GREEN, LetterState.BLACK, LetterState.YELLOW, LetterState.GREEN, LetterState.YELLOW,
        LetterState.GREEN, LetterState.BLACK, LetterState.BLACK
      ]

      expect(actual).toEqual(expected)
    })

    test('Decode full 32-bit encoded number', () => {
      let buffer = new ArrayBuffer(4)
      let view = new DataView(buffer)
      // binary: 0b1111_1111_1001_0110_1001_1010_1001_1011
      view.setUint32(0, 0xff96_9a9b)
      let encoded = view.getUint32(0)
      const actual = decode_guess_comparison(encoded)
      const expected: LetterState[] = [
        LetterState.GREEN, LetterState.YELLOW, LetterState.BLACK, LetterState.YELLOW,
        LetterState.YELLOW, LetterState.YELLOW, LetterState.BLACK, LetterState.YELLOW,
        LetterState.YELLOW, LetterState.BLACK, LetterState.BLACK, LetterState.YELLOW,
        LetterState.GREEN, LetterState.GREEN, LetterState.GREEN, LetterState.GREEN,
      ]

      expect(actual).toEqual(expected)
    })
  });
  describe('JS Endianness ', () => {
    test('ArrayBuffer get little endian', () => {
      let buffer = new ArrayBuffer(2)
      let view = new DataView(buffer)

      view.setUint16(0, 0x00f1, true /* little endian */)

      const actual = view.getUint16(0, true /* little endian */)
      const expected = 0x00f1
      expect(actual).toBe(expected)
    })

    test('ArrayBuffer get reverse endianness', () => {
      let buffer = new ArrayBuffer(2)
      let view = new DataView(buffer)

      view.setUint16(0, 0x1cf1, true /* little endian */)

      const actual = view.getUint16(0, false /* big endian */)
      const expected = 0xf11c
      expect(actual).toBe(expected)
    })

    test('Uint16 is little endian', () => {
      let uint16 = new Uint16Array(1)
      const expected = 0x001c
      uint16[0] = expected
      const actual = uint16[0]
      expect(actual).toBe(expected)
    })

    test('Make little endian uint16', () => {
      let uint16 = new Uint16Array(1)
      // just to make sure we start with 0
      uint16[0] = 0
      uint16[0] |= (0x0002 << 8)
      uint16[0] |= (0x0011)
      const actual = uint16[0]
      const expected = 0x0211
      expect(actual).toBe(expected)
    })

    test('Make little endian unit16 from bits', () => {
      let uint16 = new Uint16Array(1)
      // just to make sure we start with 0
      uint16[0] = 0

      // 0xe
      uint16[0] |= (0b11 << 14)
      uint16[0] |= (0b10 << 12)
      // 0x1
      uint16[0] |= (0b00 << 10)
      uint16[0] |= (0b01 << 8)
      // 0x5
      uint16[0] |= (0b01 << 6)
      uint16[0] |= (0b01 << 4)
      // 0xc
      uint16[0] |= (0b11 << 2)
      uint16[0] |= (0b00)

      const actual = uint16[0]
      const expected = 0xe15c
      expect(actual).toBe(expected)
    })

    test('make deep copy of uint16 element', () => {
      let uint16 = new Uint16Array(1)
      // just to make sure we start with 0
      uint16[0] = 0
      let num = 0

      // 0xe000
      num |= (0b11 << 14)
      num |= (0b10 << 12)

      expect(num).not.toBe(uint16[0])
      expect(uint16[0]).toBe(0)
      expect(num).toBe(0xe000)

    })
  });
});

