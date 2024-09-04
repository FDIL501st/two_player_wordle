//! The graphql server for the 2 player wordle game.
//! Defines the graphql schema needed for the 2 player wordle game
//! and HTTP endpoints to interact with the graphql schema.

#![warn(missing_docs)]

use lazy_static::lazy_static;
use juniper::{EmptySubscription, RootNode};
use rocket::response::content::RawHtml;
use rocket::{Build, State};
use rocket_db_pools::{
    mongodb::{Client, Collection},
    Database,
};
use serde::de::DeserializeOwned;
use std::env;


#[macro_use]
extern crate rocket;

lazy_static! {
    /// Port the client server is hosted on
    pub static ref CLIENT_PORT: u32 = env::var("CLIENT_PORT")
        .unwrap_or("3000".to_string())	// default is port 3000
        .parse()
        .expect("CLIENT_PORT should be an unsigned integer.");
		
	/// Port the matchmaking server is hosted on 
	pub static ref MATCHMAKING_PORT: u32 = env::var("MATCHMAKING_PORT")
        .unwrap_or("10001".to_string()) // default is port 10001
        .parse()
        .expect("MATCHMAKING_PORT should be an unsigned integer.");
    
    /// Port the graphql server (this server) is hosted on
    pub static ref GRAPHQL_PORT: u32 = env::var("ROCKET_PORT")
        .unwrap_or("10000".to_string()) // default port is 10000
        .parse()
        .expect("GRAPHQL_PORT should be an unsigned integer.");
}

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

/// cors header definitions to attach to server
pub mod cors;

/// Gets the the Games Collection from the Games database.
///
/// This function exists as a lot of database communications is done to the Games collection.
fn game_collection<T: DeserializeOwned + Send + Sync>(client: &MongoClient) -> Collection<T> {
    client.database("Games").collection("Games")
}

type Schema = RootNode<'static, query::Query, mutation::Mutation, EmptySubscription<MongoClient>>;

/// Builds a rocket server, so all main has to do is launch it
pub fn build_rocket() -> rocket::Rocket<Build> {
	let cors = cors::cors_options();
	
    rocket::build()
        .attach(MongoClient::init())
        .manage(Schema::new(
            query::Query,
            mutation::Mutation,
            EmptySubscription::new(),
        ))
        .mount("/", routes![index, get_graphql, post_graphql])
        .mount("/debug", routes![debug, graphiql, playground])
		.attach(cors)
}

/// Index route that is simply used to tell that the server is running
#[get("/")]
fn index() -> &'static str {
    "2 player wordle graphql server is online."
}

#[get("/")]
async fn debug() -> RawHtml<&'static str> {
    RawHtml(
        "<html><h1>Graphql Server Debug</h1>\
               <div>visit <a href=\"/debug/graphiql\">GraphiQL</a></div>\
               <div>visit <a href=\"/debug/playground\">GraphQL Playground</a></div>\
         </html>",
    )
}

#[get("/graphiql")]
fn graphiql() -> RawHtml<String> {
    juniper_rocket::graphiql_source("/graphql", None)
}

#[get("/playground")]
fn playground() -> RawHtml<String> {
    juniper_rocket::playground_source("/graphql", None)
}

#[get("/graphql?<request..>")]
async fn get_graphql(
    db: &MongoClient,
    request: juniper_rocket::GraphQLRequest,
    schema: &State<Schema>,
) -> juniper_rocket::GraphQLResponse {
    request.execute(schema, db).await
}

#[post("/graphql", data = "<request>")]
async fn post_graphql(
    db: &MongoClient,
    request: juniper_rocket::GraphQLRequest,
    schema: &State<Schema>,
) -> juniper_rocket::GraphQLResponse {
    request.execute(schema, db).await
}
