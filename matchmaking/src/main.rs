#[macro_use]
extern crate rocket;

use matchmaking::build_rocket;

#[launch]
fn rocket() -> _ {
    build_rocket()
}
