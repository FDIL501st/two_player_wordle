use rocket_cors::{CorsOptions, AllowedOrigins};
use super::{CLIENT_PORT, MATCHMAKING_PORT, GRAPHQL_PORT};

pub(super) fn cors_options() -> rocket_cors::Cors {

    let client_origin = format!("http://localhost:{}", *CLIENT_PORT);
	let matchmaking_origin = format!("http://localhost:{}", *MATCHMAKING_PORT);
    let self_origin = format!("http://localhost:{}", *GRAPHQL_PORT);
    
    // need to also add 127.0.0.1 as well
	
	// expecting requests from client and matchmaking servers
    let allowed_origins = AllowedOrigins::some_exact(
        &[
            client_origin.as_str(),
			matchmaking_origin.as_str(),
            self_origin.as_str()
        ]);
		
    CorsOptions {
        allowed_origins,
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("error creating CORS fairing")
}