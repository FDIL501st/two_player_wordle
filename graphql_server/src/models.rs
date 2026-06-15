use juniper::{GraphQLEnum, GraphQLInputObject, GraphQLObject};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::errors::{GraphqlServerError, GraphqlServerResult, CODE422};

/// scalar types to be used by some fields in the models
pub mod scalars;

/// detailed implementations of functions for encoding and decoding letter states
pub mod encoding;

use self::scalars::*;
// use self::encoding::*;

// This file contains the models/objects represented within the graphql server

/// A turn turn made by some player.
#[derive(Debug, GraphQLObject, Serialize, Deserialize, Clone, PartialEq)]
pub struct Turn {
    /// The word guessed by the player.
    guessed_word: String,

    /// the states of each letter of the word.
    /// Clients need to decode this ```int``` to actually read the state of each letter.
    letter_state: U16,
}

/// A new turn made by some player. Essentially same as ```Turn```, but used for graphql arguments.
#[derive(Debug, GraphQLInputObject, Serialize, Deserialize, Clone)]
pub struct NewTurn {
    /// The word guessed by the player.
    guess: String,

    /// The states of each letter of ```guess```.
    /// Clients need to encode the letter states and the bytes are stored as an ```int```.
    letter_state: U16,
}

impl Into<Turn> for NewTurn {
    fn into(self) -> Turn {
        Turn {
            guessed_word: self.guess,
            letter_state: self.letter_state,
        }
    }
}

/// The player type, either player 1 or player 2
#[derive(Debug, GraphQLEnum, Serialize, Deserialize, PartialEq, Eq)]
pub enum Player {
    /// Player 1
    P1,
    /// Player 2
    P2,
}

/// A round in a match.
/// A match can have multiple rounds
#[derive(Debug, GraphQLObject, Serialize, Deserialize)]
pub struct Round {
    /// A history of turns made in the round.
    /// This vector can grow as the round progresses and more turns are played.
    /// Does not include the current turn being played.
    turns: Vec<Turn>,

    /// The state of all the letters in the round.
    /// This is an encoded value, clients are responsible for encoding and decoding the bytes
    letterpool_state: U54,

    /// The current guess number the round is on.
    /// Guess number starts at 0. Meaning first guess being made is 0.
    /// # Note: This might be a pointless value as size of `turns` give the same information.
    guess_num: U8,
    /// The current player whose turn it is.
    current_player: Player,

    /// The target word that players are trying to guess for the round.
    target_word: String,
}

impl Round {
    /// Used when a new round has started in a game.
    pub fn new_round(current_player: Player, target_word: String) -> Self {
        Round {
            turns: Vec::new(),
            letterpool_state: U54::from(0),
            guess_num: U8::from(0),
            current_player,
            target_word,
        }
    }

    /// Adds `turn` to turns. `guess_num` is also updated.
    fn add_turn(&mut self, turn: Turn) {
        self.turns.push(turn);
        self.guess_num += 1;
    }

    /// Updates letterpool_state given a new turn made.
    fn update_letterpool_state(&mut self, new_turn: &Turn) {
        self.letterpool_state
            .encode_guess_results(&new_turn.guessed_word, &new_turn.letter_state);
    }
}

/// An argument with info needed to update a round whenever a turn is made.
#[derive(Debug, GraphQLInputObject, Serialize, Deserialize)]
pub struct UpdateRound {
    game_id: String,
    turn: NewTurn,
    next_player: Player,
}

/// A game that is currently active/being played.
#[derive(Debug, GraphQLObject, Serialize, Deserialize)]
pub struct Game {
    /// The id of a Game. Used by the database to identify each document.
    _id: String,
    // work with string instead of Uuid as mongodb stores a Uuid as some sort of object
    // that is hard to recreate as a rust object when trying to query from this server
    // as uuid doesn't properly serialize into bson for queries
    // and can't use bson::uuid type for a GraphQLObject which does serialize well
    /// The current round that is being played.
    current_round: Round,

    /// The points of player 1.
    p1_points: U32,

    /// The points of player 2.
    p2_points: U32,

    /// The current round number that is currently being made.
    /// This value starts at 1.
    round_num: U16,
}

impl Game {
    /// Used to create when a new game is started.
    pub fn new_game(target_word: &str) -> Self {
        Game {
            _id: Uuid::new_v4().simple().to_string(),
            current_round: Round::new_round(Player::P1, target_word.to_string()),
            p1_points: U32::from(0),
            p2_points: U32::from(0),
            round_num: U16::from(0),
        }
    }

    /// Gets the id of the game
    pub fn id(&self) -> String {
        self._id.clone()
    }

    /// Provide a new id for the game, as if making a new game.
    pub fn new_id(&mut self) {
        self._id = Uuid::new_v4().simple().to_string();
    }

    /// Sets the id of the game.
    /// Does nothing if id format is incorrect.
    pub fn set_id(&mut self, id: &String) {
        let check = Self::parse_id(id);

        if check.is_ok() {
            self._id = id.clone();
        }

        // else do nothing
    }

    /// Parses an id in some string format into the string format ```Game``` uses.
    ///
    /// # Errors
    ///
    /// Will throw a 422 error if the id provided isn't a valid uuid.
    pub fn parse_id(id: &String) -> GraphqlServerResult<String> {
        // will convert into a uuid, then back into the simple string format

        let uuid_result = Uuid::try_parse(&id);

        match uuid_result {
            Ok(uuid) => Ok(uuid.simple().to_string()),

            Err(_) => Err(GraphqlServerError::new(
                "id provided should be in the format of a uuid".to_string(),
                &CODE422,
            )),
        }
    }

    /// Updates the current round with a new turn made.
    /// This means 3 things are updated for the current round:
    /// - the turns vector
    /// - the letterpool_state
    /// - change player turn
    pub fn update_round_with_new_turn(&mut self, new_turn: NewTurn) {
        let turn: Turn = new_turn.into();

        // update letterpool_state
        self.current_round.update_letterpool_state(&turn);

        // add new turn
        self.current_round.add_turn(turn);

        // change current player
        if self.current_round.current_player == Player::P1 {
            self.current_round.current_player = Player::P2;
        } else {
            self.current_round.current_player = Player::P1;
        }
    }

    /// Gets the letterpool_state of the current round of the game.
    pub fn letterpool_state(&self) -> U54 {
        self.current_round.letterpool_state
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_new_round_from_new_game() {
        let game = Game::new_game("pizza");
        let round = Round::new_round(Player::P1, String::from("pizza"));
        assert_eq!(game.current_round.guess_num, round.guess_num);
        assert_eq!(game.current_round.current_player, round.current_player);
        assert_eq!(game.current_round.target_word, round.target_word);
    }

    #[test]
    fn storing_unsigned_ints_for_p1_points() {
        let mut game = Game::new_game("pizza");

        game.p1_points = i32::MAX.try_into().unwrap();
        game.p1_points += 1;
        // expect p1 points to not overflow
    }

    #[test]
    #[should_panic]
    fn p1_points_should_overflow_below_zero() {
        let mut game = Game::new_game("pizza");

        game.p1_points = U32::from(0);
        game.p1_points -= 1;
        // expect p1 points overflow as should be an unsigned value
    }

    #[test]
    fn storing_unsigned_ints_for_p2_points() {
        let mut game = Game::new_game("pizza");

        game.p2_points = i32::MAX.try_into().unwrap();
        game.p2_points += 1;
        // expect p2 points to not overflow
    }

    #[test]
    #[should_panic]
    fn p2_points_should_overflow_below_zero() {
        let mut game = Game::new_game("pizza");

        game.p2_points = U32::from(0);
        game.p2_points -= 1;
        // expect p2 points overflow as should be an unsigned value
    }

    #[test]
    #[should_panic]
    fn round_num_should_overflow_past_u16() {
        let mut game: Game = Game::new_game("pizza");

        game.round_num = u16::MAX.try_into().unwrap();

        // should panic due to overflow as go past limit
        game.round_num += 1;
    }

    #[test]
    #[should_panic]
    fn round_num_should_overflow_below_zero() {
        let mut game: Game = Game::new_game("pizza");

        game.round_num = U16::from(0);

        // should panic due to overflow as go below 0
        game.round_num -= 1;
    }

    #[test]
    fn storing_u64_for_letterpool_state() {
        let mut game: Game = Game::new_game("pizza");

        game.current_round.letterpool_state = u64::MAX.try_into().unwrap();
        // expect this to work as it should be able to hold this
    }

    #[test]
    #[should_panic]
    fn letterpool_in_guess_should_overflow_past_u16() {
        let mut guess: Turn = Turn {
            guessed_word: String::from("hello"),
            letter_state: U16::from(0),
        };

        guess.letter_state = u16::MAX.try_into().unwrap();

        // should now panic is try to overflow using addition
        guess.letter_state += 1;
    }

    #[test]
    #[should_panic]
    fn letterpool_in_guess_should_overflow_below_zero() {
        let mut guess: Turn = Turn {
            guessed_word: String::from("hello"),
            letter_state: U16::from(0),
        };

        // should panic as try to overflow with subtraction
        guess.letter_state -= 1;
    }

    #[test]
    #[should_panic]
    fn guess_num_should_overflow_past_u8() {
        let mut round: Round = Round {
            turns: Vec::new(),
            letterpool_state: U54::from(0),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("pizza"),
        };

        round.guess_num = u8::MAX.try_into().unwrap();

        // this should overflow, don't want guess_num to go above 255
        round.guess_num += 1;
    }

    #[test]
    #[should_panic]
    fn guess_num_should_overflow_below_zero() {
        let mut round: Round = Round {
            turns: Vec::new(),
            letterpool_state: U54::from(0),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("pizza"),
        };

        // this should overflow, don't want guess_num to be negative
        round.guess_num -= 1;
    }

    #[test]
    fn new_turn_added_to_new_round() {
        let new_turn: NewTurn = NewTurn {
            guess: String::from("words"),
            letter_state: U16::from(0),
        };

        let mut round = Round::new_round(Player::P1, String::from("words"));

        let turn: Turn = new_turn.into();

        round.add_turn(turn.clone());

        let expected = vec![turn];

        assert_eq!(round.turns, expected, "Adding a round to an empty round should just mean turns only has the added turn in it.");
    }

    #[test]
    fn new_turn_added_to_not_new_round() {
        let new_turn: NewTurn = NewTurn {
            guess: String::from("words"),
            letter_state: U16::from(0),
        };

        let mut round = Round::new_round(Player::P1, String::from("words"));
        // create previous turns for round to have
        let turn1: Turn = Turn {
            guessed_word: String::from("pizza"),
            letter_state: U16::from(0),
        };
        let turn2: Turn = Turn {
            guessed_word: String::from("feels"),
            letter_state: U16::from(0b1010101011),
        };
        round.turns = vec![turn1.clone(), turn2.clone()];

        let turn: Turn = new_turn.into();
        round.add_turn(turn.clone());

        let expected = vec![turn1, turn2, turn];

        assert_eq!(round.turns, expected, "Adding a round to a non empty round should just mean turns has the added turn at the end of the vector.");
    }
}

#[cfg(test)]
/// Tests for round updating letterpool_state
mod round_update_letterpool_state_tests {
    use super::*;
    use asserting::prelude::*;

    // the following tests are the saem as the ones in encode_guess_tests
    // do them here to confirm that no change in results by round, as all it should be doing is calling the function tested in encode_guess_tests

    #[test]
    fn round_update_only_guess_letters_others_white() {
        // setup

        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(0), // all white
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("photo"),
        };

        let turn: Turn = Turn {
            guessed_word: String::from("sales"),
            letter_state: U16::from(0b10_10_10_10_10),
        };

        round.update_letterpool_state(&turn); // function to test result of run here

        // only letters: s, a, l, e are updated
        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_00_10u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_only_guess_letters_others_mixed_state() {
        let mut round: Round = Round {
            turns: vec![], // having existing turns that simulate reaching this point in the game where letterpool_state is not 0 does not affect the unit test
            // this can be another unit test, making sure no matter the turns, actual result of updating letterpool_state is unaffected
            letterpool_state: U54::from(
                0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_00_00_00_00_10u64,
            ),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("photo"),
        };

        let turn = Turn {
            guessed_word: String::from("sales"),
            letter_state: U16::from(0b10_10_10_10_10),
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state = U54::from(
            0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_10_00_00_00_10u64,
        );
        // only letters: s, a, l, e are updated
        // other non-white letters should not be touched
        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_atleast_one_yellow_and_green_new_letterpool_state() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(0), // all white/new letterpool_state
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("green"),
        };
        let turn: Turn = Turn {
            guessed_word: String::from("grape"),
            letter_state: U16::from(0b11_11_10_10_01),
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_00_11_00_10_00_00_00_00_00_00_00_00_11_00_01_00_00_00_10u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_atleast_one_yellow_and_green_not_new_letterpool_state() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(
                0b00_00_00_10_00_00_00_00_00_00_10_10_00_00_10_00_00_00_10_11_00_00_00_00_00_00u64,
            ),
            // black: y, l, o, w, p, h
            // yellow:
            // green: g
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("green"),
        };

        let turn: Turn = Turn {
            guessed_word: String::from("grape"),
            letter_state: U16::from(0b11_11_10_10_01),
        };

        round.update_letterpool_state(&turn);

        // updated states
        // black: a
        // yellow: e
        // green: r
        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_10_00_00_00_00_11_00_10_10_00_00_10_00_00_00_10_11_00_01_00_00_00_10u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_yellow_with_green() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(
                0b00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_01u64,
            ), // only a is yellow, rest kept white
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from(""), // target_word shouldn't matter as update_letterpool_state shouldn't be touching it
                                           // this can be another test to ensure this
        };
        let turn: Turn = Turn {
            guessed_word: String::from("graph"),
            letter_state: U16::from(0b10_10_11_10_10), // only a is green, rest is black
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_00_10_00_10_00_00_00_00_00_00_00_10_10_00_00_00_00_00_11u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_green_not_update_with_yellow() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(
                0b00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_11u64,
            ), // only a is green, rest kept white
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from(""),
        };
        let turn: Turn = Turn {
            guessed_word: String::from("graph"),
            letter_state: U16::from(0b10_10_01_10_10), // only a is yellow, rest is black
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_00_10_00_10_00_00_00_00_00_00_00_10_10_00_00_00_00_00_11u64,
        ); // expect a to not update

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_not_update_when_same_state() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(
                0b00_00_00_00_00_00_00_00_11_00_11_00_00_00_00_00_00_00_11_11_00_00_00_00_00_11u64,
            ), // g, r, a, p, h already green
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from(""),
        };
        let turn: Turn = Turn {
            guessed_word: String::from("graph"),
            letter_state: U16::from(0b11_11_11_11_11), // all green
        };

        round.update_letterpool_state(&turn);
        // expected is same as actual as no updated should be made
        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_00_11_00_11_00_00_00_00_00_00_00_11_11_00_00_00_00_00_11u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    // tests to make sure that `turns` don't affect update_letterpool_state

    #[test]
    fn round_update_turns_size_1() {
        let turn1: Turn = Turn {
            guessed_word: String::from(""),
            letter_state: U16::from(0b10_01_01_01_01),
        };
        let mut round: Round = Round {
            turns: vec![turn1],
            letterpool_state: U54::from(
                0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_00_00_00_00_10u64,
            ),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("photo"),
        };

        let turn = Turn {
            guessed_word: String::from("sales"),
            letter_state: U16::from(0b10_10_10_10_10),
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state = U54::from(
            0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_10_00_00_00_10u64,
        );
        // only letters: s, a, l, e are updated
        // other non-white letters should not be touched
        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_turns_size_2() {
        let turn1: Turn = Turn {
            guessed_word: String::from(""),
            letter_state: U16::from(0b10_01_01_01_01),
        };
        let turn2: Turn = Turn {
            guessed_word: String::from("words"),
            letter_state: U16::from(0b0),
        };
        let mut round: Round = Round {
            turns: vec![turn1, turn2],
            letterpool_state: U54::from(
                0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_00_00_00_00_10u64,
            ),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("photo"),
        };

        let turn = Turn {
            guessed_word: String::from("sales"),
            letter_state: U16::from(0b10_10_10_10_10),
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state = U54::from(
            0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_10_00_00_00_10u64,
        );
        // only letters: s, a, l, e are updated
        // other non-white letters should not be touched
        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    #[test]
    fn round_update_turns_size_3() {
        let turn1: Turn = Turn {
            guessed_word: String::from(""),
            letter_state: U16::from(0b10_01_01_01_01),
        };
        let turn2: Turn = Turn {
            guessed_word: String::from("words"),
            letter_state: U16::from(0b0),
        };
        let turn3: Turn = Turn {
            guessed_word: String::from("falls"),
            letter_state: U16::from(0b01_01_01_01_01),
        };
        let mut round: Round = Round {
            turns: vec![turn1, turn2, turn3],
            letterpool_state: U54::from(
                0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_00_00_00_00_10u64,
            ),
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("photo"),
        };

        let turn = Turn {
            guessed_word: String::from("sales"),
            letter_state: U16::from(0b10_10_10_10_10),
        };

        round.update_letterpool_state(&turn);

        let expected_letterpool_state = U54::from(
            0b01_10_00_00_00_00_00_10_00_00_00_00_00_00_10_00_00_10_00_00_10_10_00_00_00_10u64,
        );
        // only letters: s, a, l, e are updated
        // other non-white letters should not be touched
        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }

    // tests to make sure that target_word doesn't affect update_letterpool_state()
    // in hindsight though, it prob makes more sense for backend(this) or a different service to handle figuring out if letters are correct or not
    // instead of letting clients/guessers to compare themselves
    // brings oppurtunity of hacking by intercepting the message and sending a fake message to server, saying your empty word guess was all green/correct.
    // NewTurn { guess: "",  letter_state: 0b11_11_11_11_11 }

    #[test]
    fn round_update_same_target() {
        let mut round: Round = Round {
            turns: vec![],
            letterpool_state: U54::from(
                0b00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_00_01u64,
            ), // only a is yellow, rest kept white
            guess_num: U8::from(0),
            current_player: Player::P1,
            target_word: String::from("graph"),
        };
        let turn: Turn = Turn {
            guessed_word: String::from("graph"),
            letter_state: U16::from(0b10_10_11_10_10), // only a is green, rest is black
        };
        // this in practice doesn't make sense as letter_state should be all green, but this test shows that target_word doesn't affect results
        // only what the turn is

        round.update_letterpool_state(&turn);

        let expected_letterpool_state: U54 = U54::from(
            0b00_00_00_00_00_00_00_00_10_00_10_00_00_00_00_00_00_00_10_10_00_00_00_00_00_11u64,
        );

        assert_that!(round.letterpool_state).is_equal_to(expected_letterpool_state);
    }
}
