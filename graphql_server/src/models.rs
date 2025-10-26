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
#[derive(Debug, GraphQLObject, Serialize, Deserialize)]
pub struct Turn {
    /// The word guessed by the player.
    guessed_word: String,

    /// the states of each letter of the word.
    /// Clients need to decode this ```int``` to actually read the state of each letter.
    letter_state: U16,
}

/// A new turn made by some player. Essentially same as ```Turn```, but used for graphql arguments.
#[derive(Debug, GraphQLInputObject, Serialize, Deserialize)]
pub struct NewTurn {
    /// The word guessed by the player.
    guess: String,

    /// The states of each letter of ```guess```.
    /// Clients need to encode the letter states and the bytes are stored as an ```int```.
    letter_state: U16,
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
    /// Guess number starts at 0.
    guess_num: U8,
    /// The current player whose turn it is.
    current_player: Player,

    /// The target word that players are trying to guess for the round.
    target_word: String,
}

impl Round {
    /// Used when a new round has started in a game.
    pub fn new_round(guess_num: i32, current_player: Player, target_word: String) -> Self {
        Round {
            turns: Vec::new(),
            letterpool_state: U54::from(0),
            guess_num: U8::from(guess_num),
            current_player,
            target_word,
        }
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
            current_round: Round::new_round(0, Player::P1, target_word.to_string()),
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
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_new_round_from_new_game() {
        let game = Game::new_game("pizza");
        let round = Round::new_round(0, Player::P1, String::from("pizza"));
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
        let mut guess: Turn = Turn { guessed_word: String::from("hello"), letter_state: U16::from(0) };
        
        guess.letter_state = u16::MAX.try_into().unwrap();

        // should now panic is try to overflow using addition
        guess.letter_state += 1;
    }

    #[test]
    #[should_panic]
    fn letterpool_in_guess_should_overflow_below_zero() {
        let mut guess: Turn = Turn { guessed_word: String::from("hello"), letter_state: U16::from(0) };

        // should panic as try to overflow with subtraction
        guess.letter_state -= 1;
    }

    #[test]
    #[should_panic]
    fn guess_num_should_overflow_past_u8() {
        let mut round: Round = Round { turns: Vec::new(), letterpool_state: U54::from(0), guess_num: U8::from(0), 
            current_player: Player::P1, target_word: String::from("pizza") };
        
        round.guess_num = u8::MAX.try_into().unwrap();
        
        // this should overflow, don't want guess_num to go above 255
        round.guess_num += 1;
    }

    #[test]
    #[should_panic]
    fn guess_num_should_overflow_below_zero() {
                let mut round: Round = Round { turns: Vec::new(), letterpool_state: U54::from(0), guess_num: U8::from(0), 
            current_player: Player::P1, target_word: String::from("pizza") };
        
        // this should overflow, don't want guess_num to be negative
        round.guess_num -= 1;
    }

}