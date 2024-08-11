use rocket_cors::{CorsOptions, AllowedOrigins};
use super::{CLIENT_PORT, MATCHMAKING_PORT};

pub(super) fn cors_options() -> rocket_cors::Cors {

    let client_origin = format!("http://localhost:{}", *CLIENT_PORT);
	let matchmaking_origin = format!("http://localhost:{}", *MATCHMAKING_PORT);
	
	// expecting requests from client and matchmaking servers
    let allowed_origins = AllowedOrigins::some_exact(
        &[
            client_origin.as_str(),
			matchmaking_origin.as_str(),
        ]);
		
    CorsOptions {
        allowed_origins,
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("error creating CORS fairing")
}