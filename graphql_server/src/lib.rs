use juniper::{EmptySubscription, RootNode};
use rocket::Build;
use rocket_db_pools::{mongodb::Client, Database};

#[macro_use] extern crate rocket;

/// mongodb connection
#[derive(Database)]
#[database("mongodb")]
pub struct MongoClient(Client);
impl juniper::Context for MongoClient {}

/// module for the graphql server queries
pub mod query;

/// module for the graphql server mutations
pub mod mutation;

/// module for the models (graphql types) that will be represented in this server
pub mod models;

/// module for the errors that will be used within this server
pub mod errors;

type Schema = RootNode<'static, query::Query, mutation::Mutation, EmptySubscription<MongoClient>>;

/// Builds a rocket server, so all main has to do is launch it
pub fn build_rocket() -> rocket::Rocket<Build> {
    rocket::build()
    .attach(MongoClient::init())
    .manage(Schema::new(
        query::Query,
        mutation::Mutation,
        EmptySubscription::new(),
    ))
    .mount("/", routes![index])
}

/// Index route that is simply used to tell that the server is running
#[get("/")]
fn index() -> &'static str {
    "2 player wordle graphql server is online."
}
