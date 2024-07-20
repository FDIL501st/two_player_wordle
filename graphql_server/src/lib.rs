use juniper::{RootNode, EmptySubscription};
use rocket::Build;
use rocket_db_pools::{mongodb::Client, Database};

/// mongodb connection
#[derive(Database)]
#[database("mongodb")]
pub struct MongoClient(Client);

impl juniper::Context for MongoClient {}

pub struct Query;

#[juniper::graphql_object]
#[graphql(context = MongoClient)]
impl Query {
    fn api_version() -> &'static str {
        "1.0"
    }
}

pub struct Mutation;

#[juniper::graphql_object]
#[graphql(context = MongoClient)]
impl Mutation {
    fn api_version() -> &'static str {
        "1.0"
    }
}

pub type Schema = RootNode<'static, Query, Mutation, EmptySubscription<MongoClient>>;

pub fn build_rocket() -> rocket::Rocket<Build> {
    rocket::build()
    .attach(MongoClient::init())
    .manage(Schema::new(
        Query,
        Mutation,
        EmptySubscription::new(),
    ))
}
