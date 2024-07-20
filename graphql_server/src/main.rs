use graphql_server::build_rocket;

#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "2 player wordle graphql server is online."
}

#[launch]
fn rocket() -> _ {
    build_rocket().mount("/", routes![index])
}
