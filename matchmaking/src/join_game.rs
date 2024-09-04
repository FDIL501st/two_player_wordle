use super::GRAPHQL_PORT;
use crossbeam_channel;
use crossbeam_channel::{Receiver, Sender};
use rocket::serde::json::Json;
use rocket::State;
use std::sync::Arc;
use tokio::sync::{Barrier, Semaphore};

/// Player1 or Player2 label
#[derive(Debug, Serialize, Deserialize, Clone)]
enum Player {
    P1,
    P2,
}

/// Response type for join_game
#[derive(Debug, Serialize, Deserialize)]
pub struct JoinGameResponse {
    game_id: Option<String>,
    player_type: Player,
}

/// Endpoint used by clients when trying to join a new game
/// If game_id returned is None, then an error occurred with connecting to
/// the graphql server.
#[get("/join_game")]
pub async fn join_game(
    barrier: &State<Arc<Barrier>>,
    sem: &State<Arc<Semaphore>>,
    sender: &State<Arc<Sender<Option<String>>>>,
    receiver: &State<Arc<Receiver<Option<String>>>>,
) -> Json<JoinGameResponse> {
    // use barrier as our "queue"
    // it will let us pair up 2 clients

    // leader calls create_game, sends game_id and is P1
    // other recv game_id and is P2
    let barrier_result = barrier.wait().await;

    // use semaphore to only allow a single pair of threads to use a crossbeam_channel at once
    let sem_permit = sem
        .acquire()
        .await
        .expect("Join Game semaphore should be open.");

    let json = match barrier_result.is_leader() {
        true => {
            let game_id = create_game().await;

            println!("{:?}", game_id);

            sender
                .send(game_id.clone())
                .expect("game_id sender should work");

            let player_type = Player::P1;

            Json(JoinGameResponse {
                game_id,
                player_type,
            })
        }
        false => {
            let game_id = receiver.recv().expect("game_id receiver should work");

            let player_type = Player::P2;

            Json(JoinGameResponse {
                game_id,
                player_type,
            })
        }
    };

    // release semaphore
    drop(sem_permit);

    // return
    json
}

#[derive(Debug, Serialize, Deserialize)]
struct MutationQuery {
    query: String,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
struct MutationData {
    newGame: String,
    // must be this name as that is field name in graphql server response
    // not doing so makes this fail to properly deserialize
}
#[derive(Debug, Serialize, Deserialize)]
struct MutationResponse {
    data: MutationData,
}

/// Attempts to create a game in the graphql server. Returns the game id.
/// If there was an error with communications with the graphql server, then this returns None.
async fn create_game() -> Option<String> {
    let client = reqwest::Client::new();

    let url: String = format!("http://localhost:{}/graphql", *GRAPHQL_PORT);
    let data = MutationQuery {
        query: "mutation{newGame}".to_string(),
    };

    let res = client.post(url).json(&data).send().await;
    
    return match res {
        Ok(res) => {
            match res.json::<MutationResponse>().await {
                Ok(mutation_response) => {
                    Some(mutation_response.data.newGame)
                }

                // deserialization fail
                Err(_) => None
            }
        }

        // incorrect url or graphql server didn't respond
        Err(_) => None
    }
}


#[cfg(test)]
mod test {
    use super::*;
    use futures::executor::block_on;
    // need block_on to use async functions in non-async methods
    // as tests can't be async functions
    
    // this test will fail if graphql server is not online
    #[test]
    fn get_game_id_from_create_game() {

        let game_id = block_on(create_game());

        assert_ne!(game_id, None, "Expected create_game to provide an actual game_id.");
    }
}