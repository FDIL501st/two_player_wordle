use crate::models::scalars::U54;

use super::{
    errors::{GraphqlServerError, CODE500},
    game_collection,
    models::Game,
    models::NewTurn,
    MongoClient,
};
use juniper::{graphql_object, FieldError, FieldResult, IntoFieldError};
use rocket_db_pools::mongodb::{bson::doc, Collection};

/// Root Mutation node
pub struct Mutation;

#[graphql_object]
#[graphql(context = MongoClient)]
impl Mutation {
    fn api_version() -> &'static str {
        "1.0"
    }

    /// Creates a new game. Returns true if successful.
    ///
    /// # Errors
    ///
    /// This function will return an error if failed to create a new game.
    /// Most likely cause is being unable to connect to the database.
    async fn new_game(
        context: &MongoClient,

        #[graphql(default = "words")] word: String,
    ) -> FieldResult<String> {
        let games: Collection<Game> = game_collection(context);

        let mut new_game = Game::new_game(word.as_str());

        let mut attempt: u8 = 0;
        let max_retry: u8 = 2;
        loop {
            let insert_one_result = games.insert_one(&new_game, None).await;
            return match insert_one_result {
                Err(_) => {
                    // let it retry with new id, as it is possible if try to insert duplicate id
                    // duplicate id can occur, though rare
                    if attempt < max_retry {
                        attempt += 1;
                        new_game.new_id();
                        continue;
                    }

                    Err(
                        GraphqlServerError::new("Failed to execute insert".to_string(), &CODE500)
                            .into_field_error(),
                    )
                }
                // simply return the id of the game created
                Ok(_) => Ok(new_game.id()),
            };
        }
    }

    /// Testing creation of new game by providing a id instead of letting program generate one.
    /// Also testing default arguments.
    async fn test_new_game(
        context: &MongoClient,
        id: String,
        #[graphql(default = "words")] word: String,
    ) -> FieldResult<String> {
        let games: Collection<Game> = game_collection(context);
        let mut new_game = Game::new_game(word.as_str());
        new_game.set_id(&id);

        let insert_one_result = games.insert_one(&new_game, None).await;
        match insert_one_result {
            Err(e) => Err(FieldError::from(e)),
            // simply return the id of the game created
            Ok(_) => Ok(new_game.id()),
        }
    }

    /// Removes a game from the database.
    ///
    /// # Errors
    ///
    /// This function will return an error if failed to delete the query.
    /// Most likely cause is id given not existing.
    async fn remove_game(context: &MongoClient, id: String) -> FieldResult<bool> {
        let games: Collection<Game> = game_collection(context);

        let game_id = Game::parse_id(&id)?;
        let delete_query = doc! {"_id": &game_id};
        let delete_one_result = games.delete_one(delete_query, None).await;

        match delete_one_result {
            // Can get an Ok even if delete nothing
            // Meaning only get an Err if simply failed to execute the delete
            Err(_) => Err(GraphqlServerError::new(
                "Failed to execute delete".to_string(),
                &CODE500,
            )
            .into_field_error()),
            // return true if deleted a game
            Ok(delete_result) => Ok(delete_result.deleted_count == 1),
        }
    }

    /// Removes all games from the database.
    ///
    /// # Errors
    ///
    /// This function will return an error if failed to execute the delete query.
    /// Most likely cause is a connection error to database.
    async fn remove_games(context: &MongoClient) -> FieldResult<bool> {
        let games: Collection<Game> = game_collection(context);
        let delete_many_result = games.delete_many(doc! {}, None).await;

        match delete_many_result {
            Err(_) => Err(GraphqlServerError::new(
                "Failed to execute all deletes".to_string(),
                &CODE500,
            )
            .into_field_error()),

            // return true if delete occurred
            Ok(_) => Ok(true),
        }
    }

    /// Adds a turn to the round in the database.
    /// Returns the updated letterpool state of the round.
    ///
    /// # Errors
    ///
    /// This function will return an error if failed to execute the find query.
    /// Most likely cause is a connection error to database.
    #[allow(
        non_snake_case,
        reason = "need similar variable name game_id, one for argument/graphql query and one for use within function"
    )]
    async fn add_turn(context: &MongoClient, gameID: String, turn: NewTurn) -> FieldResult<U54> {
        let games: Collection<Game> = game_collection(context);
        let game_id = Game::parse_id(&gameID)?;
        // using gameid, get game needed from db, so we can get the letterpoolstate of the current round
        let find_game_query = doc! {"_id": &game_id};
        let find_game_result = games.find_one(find_game_query, None).await;

        let mut game: Game = match find_game_result {
            Err(e) => return Err(GraphqlServerError::new(e.to_string(), &CODE500).into_field_error()),

            Ok(queried_game) => match queried_game {
                None => return Err(GraphqlServerError::new(
                    "Server made unexpected response by returning nothing instead of empty result to query.".to_string(),
                    &CODE500
                )
                .into_field_error()),

                Some(game) => game
            }
        };
        // any error occured with the query, we return immediately with an error
        // so going forth, we have a game to work with
        game.update_round_with_new_turn(turn);

        // placeholder return
        Ok(game.letterpool_state())
    }
}
