use std::cmp::min;
use asserting::prelude::*;

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

/// Combines two `LetterState` values within a guess, returning the the state that will be kept in the backend.
/// The order of states stored is: GREEN > YELLOW > BLACK.
fn combine_guess_letter_states(state1: LetterState, state2: LetterState) -> LetterState {
    assert_that!(state1).is_not_equal_to(LetterState::WHITE);
    assert_that!(state2).is_not_equal_to(LetterState::WHITE);

    let a: u8 = (state1 as u8 + 1) & 0b11;
    let b: u8 = (state2 as u8 + 1) & 0b11;
    let mut c: u8 = min(a, b);
    c = (c+3) & 0b11; // reverse the +1 from above

    return c.into();
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
}
