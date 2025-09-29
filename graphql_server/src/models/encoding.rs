use std::cmp::min;

/// Represents the state of a letter in a round.
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
    let a: u8 = (state1 as u8 + 1) & 0b11;
    let b: u8 = (state2 as u8 + 1) & 0b11;
    let mut c: u8 = min(a, b);
    c = (c+3) & 0b11; // reverse the +1 from above

    return c.into();
}
