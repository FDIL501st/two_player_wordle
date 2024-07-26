use juniper::{graphql_object, FieldResult, IntoFieldError};
use rocket_db_pools::mongodb::{bson::doc, Collection};
use uuid::Uuid;
use super::{
    errors::{GraphqlServerError, CODE500,CODE422},
    game_collection,
    models::Game,
    MongoClient,
};

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
    async fn new_game(context: &MongoClient) -> FieldResult<bool> {
        let games: Collection<Game> = game_collection(context);

        let new_game = Game::new_game("words");

        let insert_result = games.insert_one(new_game, None).await;
        match insert_result {
            // TODO: Upon error, see if its due to conflicting id then try again, or return a 500 Internal Server Error
            Err(_) => Ok(false),
            Ok(_) => Ok(true),
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

        // convert string to simple uuid format (in case its in a different uuid format)
        let uuid_result = Uuid::try_parse(&id);
        if uuid_result.is_err() {
            return Err(
                GraphqlServerError::new("id provided should be in the format of a uuid".to_string(), &CODE422)
                    .into_field_error()
            )
        }
        let uuid = uuid_result.unwrap();
        let game_id = uuid.simple().to_string();
        let delete_query = doc! {"_id": &game_id};
        let delete_result = games.delete_one(delete_query, None).await;
        // for some reason this is not deleting, even if I copy id
        match delete_result {
            // TODO: Update Ok section
            // Can get an Ok even if delete nothing
            // Meaning only get an Err if simply failed to execute the delete
            Err(_) => Err(
                GraphqlServerError::new("Failed to execute delete".to_string(), &CODE500)
                    .into_field_error(),
            ),
            // return true if deleted a game
            Ok(delete_result) => Ok(delete_result.deleted_count == 1),
        }
    }
}
