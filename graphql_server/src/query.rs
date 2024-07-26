use super::{
    errors::{GraphqlServerError, CODE404, CODE500},
    game_collection,
    models::Game,
    MongoClient,
};
use juniper::{graphql_object, FieldResult, IntoFieldError};
use rocket_db_pools::mongodb::{bson::doc, Collection};

/// Root query node
pub struct Query;

#[graphql_object]
#[graphql(context = MongoClient)]
impl Query {
    fn api_version() -> &'static str {
        "1.0"
    }

    /// Get all games
    async fn games(context: &MongoClient) -> FieldResult<Vec<Game>> {
        let games: Collection<Game> = game_collection(context);

        let query_result = games.find(doc! {}, None).await;

        match query_result {
            Err(_e) => Ok(Vec::<Game>::new()),
            Ok(mut cursor) => {
                let mut all_games: Vec<Game> = Vec::new();

                while cursor.advance().await? {
                    all_games.push(cursor.deserialize_current()?);
                }

                Ok(all_games)
            }
        }
    }

    /// Get a game
    async fn game(context: &MongoClient, id: String) -> FieldResult<Game> {
        // get game_id
        let game_id = Game::parse_id(&id)?;

        let games: Collection<Game> = game_collection(context);

        let query_result = games.find_one(doc! {"_id": &game_id}, None).await;

        match query_result {
            Ok(game) => match game {
                None => Err(
                    GraphqlServerError::new("No game with id found".to_string(), &CODE404)
                        .into_field_error(),
                ),
                Some(game) => Ok(game),
            },
            Err(_) => Err(GraphqlServerError::new(
                "Failed to execute find game query".to_string(),
                &CODE500,
            )
            .into_field_error()),
        }
    }
}
