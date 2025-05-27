use super::{
    errors::{GraphqlServerError, CODE500},
    game_collection,
    models::Game,
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
    async fn new_game(context: &MongoClient,
                      
                      #[graphql(default = "words")] 
                      word: String) -> FieldResult<String> {
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
    async fn test_new_game(context: &MongoClient, id: String,
                           #[graphql(default = "words")]
                           word: String) -> FieldResult<String> {
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
    /// This function will return an error if failed to delete the query.
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

    async fn add_turn(context: &MongoClient) -> FieldResult<bool> {
        Ok(true)
    }
}
