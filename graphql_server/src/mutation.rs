use juniper::graphql_object;
use super::MongoClient;


pub struct Mutation;

#[graphql_object]
#[graphql(context = MongoClient)]
impl Mutation {
    fn api_version() -> &'static str {
        "1.0"
    }
}
