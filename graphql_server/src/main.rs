use graphql_server::build_rocket;

#[macro_use]
extern crate rocket;

#[launch]
fn rocket() -> _ {
    build_rocket()
}
