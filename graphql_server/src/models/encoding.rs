use std::{cmp::min, collections::{HashMap}};
use asserting::prelude::*;

use super::scalars::{U54, U16};

/// Represents the state of a letter in a round.
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum LetterState {
    /// The letter has not been guessed yet.
    WHITE,
    /// The letter is in the word but in the wrong position.
    YELLOW,
    /// The letter is not in the word.
    BLACK,
    /// The letter is in the correct position.
    GREEN
}

impl From<i32> for LetterState {
    fn from(value: i32) -> Self {
        match value {
            0 => LetterState::WHITE,
            1 => LetterState::YELLOW,
            2 => LetterState::BLACK,
            3 => LetterState::GREEN,
            _ => panic!("{}", format!("Invalid value: {}, for LetterState", value)),
        }
    }
}
impl From<u8> for LetterState {
    fn from(value: u8) -> Self {
        match value {
            0 => LetterState::WHITE,
            1 => LetterState::YELLOW,
            2 => LetterState::BLACK,
            3 => LetterState::GREEN,
            _ => panic!("{}", format!("Invalid value: {}, for LetterState", value)),
        }
    }
}
impl From<u16> for LetterState {
    fn from(value: u16) -> Self {
        match value {
            0 => LetterState::WHITE,
            1 => LetterState::YELLOW,
            2 => LetterState::BLACK,
            3 => LetterState::GREEN,
            _ => panic!("{}", format!("Invalid value: {}, for LetterState", value)),
        }
    }
}
impl From<u64> for LetterState {
    fn from(value: u64) -> Self {
        match value {
            0 => LetterState::WHITE,
            1 => LetterState::YELLOW,
            2 => LetterState::BLACK,
            3 => LetterState::GREEN,
            _ => panic!("{}", format!("Invalid value: {}, for LetterState", value)),
        }
    }
}


impl Into<i32> for LetterState {
    fn into(self) -> i32 {
        match self {
            LetterState::WHITE => 0,
            LetterState::YELLOW => 1,
            LetterState::BLACK => 2,
            LetterState::GREEN => 3,
        }
    }
}
impl Into<u8> for LetterState {
    fn into(self) -> u8 {
        match self {
            LetterState::WHITE => 0,
            LetterState::YELLOW => 1,
            LetterState::BLACK => 2,
            LetterState::GREEN => 3,
        }
    }
}
impl Into<u16> for LetterState {
    fn into(self) -> u16 {
        match self {
            LetterState::WHITE => 0,
            LetterState::YELLOW => 1,
            LetterState::BLACK => 2,
            LetterState::GREEN => 3,
        }
    }
}
impl Into<u64> for LetterState {
    fn into(self) -> u64 {
        match self {
            LetterState::WHITE => 0,
            LetterState::YELLOW => 1,
            LetterState::BLACK => 2,
            LetterState::GREEN => 3,
        }
    }
}


/// Combines two `LetterState` values within a guess, returning the the state that will be kept in the backend.
/// The order of states stored is: GREEN > YELLOW > BLACK.
pub fn combine_guess_letter_states(state1: LetterState, state2: LetterState) -> LetterState {
    assert_that!(state1).is_not_equal_to(LetterState::WHITE);
    assert_that!(state2).is_not_equal_to(LetterState::WHITE);

    let a: u8 = (state1 as u8 + 1) & 0b11;
    let b: u8 = (state2 as u8 + 1) & 0b11;
    let mut c: u8 = min(a, b);
    c = (c+3) & 0b11; // reverse the +1 from above

    return c.into();
}
pub fn combine_guess_letter_states_encoded(state1: u8, state2: u8) -> u8 {
    assert_that!(state1).is_not_equal_to(LetterState::WHITE as u8);
    assert_that!(state2).is_not_equal_to(LetterState::WHITE as u8);

    let a: u8 = (state1 + 3) & 0b11;
    let b: u8 = (state2 + 3) & 0b11;
    let mut c: u8 = std::cmp::max(a, b);
    c = (c+1) & 0b11; // reverse the +3 from above

    c
}

/// Prepares the guess for encoding by combining letter states for duplicate letters.
pub fn prepare_guess_for_encoding(guess: &String, states: &U16) -> (String, U16) { 
    let num_chars = guess.len();
    assert_that!(num_chars).is_less_than(9);
    // 8 is max word length, so should never be greater than 9

    // convert U16 to Vec<u8>
    let letter_states: Vec<u8> = states.into();
    // assert no WHITE states is redundant as combine_guess_letter_states below asserts this as well
    assert_that!(&letter_states).does_not_contain(&(LetterState::WHITE as u8));

    let mut letter_state_map: HashMap<char, u8> = HashMap::new();

    for (letter, state) in guess.chars().zip(letter_states.iter()) {

        if let Some(existing_state) = letter_state_map.get(&letter) {
            // found existing letter, combine states
            let combined_state = combine_guess_letter_states_encoded(*existing_state, *state);
            letter_state_map.insert(letter, combined_state);
        } else {
            // insert new letter with its state
            letter_state_map.insert(letter, *state);
        }
    }
    
    // build output from letter_state_map
    let letters: String = letter_state_map.keys().collect();
    let states: U16 = U16::from(letter_state_map.values().collect::<Vec<&u8>>());
    
    (letters, states)
    
}



impl U54 {
    /// Encodes the guess results by updating the internal state with the provided letters and their states.
    pub fn encode_guess_results(&mut self, guess: &String, states: &U16) {
        assert_that!(guess.len()).is_less_than(9);
        // redundant as prepare_guess_for_encoding asserts this as well

        let (letters, new_states) = prepare_guess_for_encoding(guess, states);
        let mut new_states: u64 = new_states.into();

        for letter in letters.chars() {
            
            // first figure out encoded state to insert

            let state_value: u64 = new_states & 0b11; // Get the lowest 2 bits
            new_states >>= 2; // Shift right to process the next state in the next iteration

            // next figure out position to insert at
            let letter_value: u8 = (letter as u8 - b'a') as u8; // 'a' -> 0, 'b' -> 1, ..., 'z' -> 25
            
            let position = letter_value * 2; // Each letter uses 2 bits
            // no need for a mask as logic has been ensured that direct OR should be fine
            // as either the bits are 00 (WHITE) or we are setting them to a higher value
            // black stays black
            // yellow stays yellow or goes to green
            // green stays green     

            // Update the corresponding bits in the u64 using OR
            *self |= state_value << position;
        }

        
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // test that WHITE input panics
    #[test]
    #[should_panic]
    fn combine_not_expect_white_1() {
        combine_guess_letter_states(LetterState::WHITE, LetterState::BLACK);
    }
    #[test]
    #[should_panic]
    fn combine_not_expect_white_2() {
        combine_guess_letter_states(LetterState::YELLOW, LetterState::WHITE);
    }

    // tests confirming same inputs give same outputs
    #[test]
    fn test_combine_black_black_output_black() {
        assert_that!(combine_guess_letter_states(LetterState::BLACK, LetterState::BLACK)).is_equal_to(LetterState::BLACK);
    }
    #[test]
    fn test_combine_yellow_yellow_output_yellow() {
        assert_that!(combine_guess_letter_states(LetterState::YELLOW, LetterState::YELLOW)).is_equal_to(LetterState::YELLOW);
    }
    #[test]
    fn test_combine_green_green_output_green() {
        assert_that!(combine_guess_letter_states(LetterState::GREEN, LetterState::GREEN)).is_equal_to(LetterState::GREEN);
    }

    
    // tests that black + yellow = yellow
    #[test]
    fn test_combine_black_yellow_output_yellow() {
        assert_that!(combine_guess_letter_states(LetterState::BLACK, LetterState::YELLOW)).is_equal_to(LetterState::YELLOW);
    }
    #[test]
    fn test_combine_yellow_black_output_yellow() {
        assert_that!(combine_guess_letter_states(LetterState::YELLOW, LetterState::BLACK)).is_equal_to(LetterState::YELLOW);
    }   

    // tests that black + green = green
    #[test]
    fn test_combine_black_green_output_green() {
        assert_that!(combine_guess_letter_states(LetterState::BLACK, LetterState::GREEN)).is_equal_to(LetterState::GREEN);
    }   
    #[test]
    fn test_combine_green_black_output_green() {
        assert_that!(combine_guess_letter_states(LetterState::GREEN, LetterState::BLACK)).is_equal_to(LetterState::GREEN);
    }   
    
    // tests that yellow + green = green
    #[test]
    fn test_combine_yellow_green_output_green() {
        assert_that!(combine_guess_letter_states(LetterState::YELLOW, LetterState::GREEN)).is_equal_to(LetterState::GREEN);
    }
    #[test]
    fn test_combine_green_yellow_output_green() {
        assert_that!(combine_guess_letter_states(LetterState::GREEN, LetterState::YELLOW)).is_equal_to(LetterState::GREEN);
    }

    // #[test]
    // fn ref_vec_contains_ref_value() {
    //     let vec = vec![LetterState::BLACK, LetterState::YELLOW];
    //     assert_that!(&vec).contains(&LetterState::BLACK);
    // }
    // #[test]
    // fn ref_vec_does_not_contain_ref_value() {
    //     let vec = vec![LetterState::BLACK, LetterState::YELLOW];
    //     assert_that!(&vec).does_not_contain(&LetterState::WHITE);
    // }
}
