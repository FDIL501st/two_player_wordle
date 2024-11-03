use rocket_cors::{CorsOptions, AllowedOrigins};
use super::CLIENT_PORT;

pub(super) fn cors_options() -> rocket_cors::Cors {

    let client_origin = format!("http://localhost:{}", *CLIENT_PORT);
    let client_origin2 = format!("http://127.0.0.1:{}", *CLIENT_PORT);

    let allowed_origins = AllowedOrigins::some_exact(
        &[
            client_origin.as_str(),
            client_origin2.as_str(),
        ]);

    CorsOptions {
        allowed_origins,
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("error creating CORS fairing")
}

