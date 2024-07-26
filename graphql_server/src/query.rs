use crate::game_collection;
use juniper::{graphql_object, FieldResult};
use rocket_db_pools::mongodb::{bson::doc, Collection};

use super::{models::Game, MongoClient};

/// Root query node
pub struct Query;

#[graphql_object]
#[graphql(context = MongoClient)]
impl Query {
    fn api_version() -> &'static str {
        "1.0"
    }

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
}
