//! Matchmaking queue
//!
//! Used to pair up players trying to join a game and
//! get them connected to a Game that can interact with in the graphql_server

#![warn(missing_docs)]

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate serde;

use lazy_static::lazy_static;
use rocket::Build;
use rocket_db_pools::mongodb::bson::doc;
use rocket_db_pools::mongodb::Client;
use rocket_db_pools::Database;
use std::env;
use std::sync::Arc;
use tokio::sync::{Barrier, Semaphore};

lazy_static! {
    /// Port the graphql server is hosted on
    pub static ref GRAPHQL_PORT: u32 = env::var("GRAPHQL_PORT")
        .unwrap_or("10000".to_string())
        .parse()
        .expect("GRAPHQL_PORT should be an unsigned integer.");
}

/// mongodb connection
#[derive(Database)]
#[database("mongodb")]
pub struct MongoClient(Client);

/// The join_game endpoint used by clients to join a matchmaking queue when trying to join a game
pub mod join_game;

/// Builds a rocket server, so all main has to do is launch it
pub fn build_rocket() -> rocket::Rocket<Build> {
    // barrier to only allow 2 people (not less or more) to get out of queue at once
    // this ensures 2 players will be paired up when leaving the queue
    let barrier = Arc::new(Barrier::new(2));

    let sem = Arc::new(Semaphore::new(2));

    let (tx, rx) = crossbeam_channel::bounded::<Option<String>>(0);
    let tx = Arc::new(tx);
    let rx = Arc::new(rx);

    rocket::build()
        .attach(MongoClient::init())
        .manage(barrier)
        .manage(sem)
        .manage(tx)
        .manage(rx)
        .mount("/", routes![index, join_game::join_game])
}

/// Index route that is simply used to tell that the server is running
#[get("/")]
fn index() -> &'static str {
    "2 player wordle matchmaking server is online."
}
