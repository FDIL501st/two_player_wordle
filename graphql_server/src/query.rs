use juniper::graphql_object;
use super::MongoClient;


pub struct Query;

#[graphql_object]
#[graphql(context = MongoClient)]
impl Query {
    fn api_version() -> &'static str {
        "1.0"
    }
}
