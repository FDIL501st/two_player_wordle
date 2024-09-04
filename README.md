# Running this Application

It is recommended to run with docker compose.

## Running with docker compose

You will need a .env file in the parent directory as [compose.yaml](compose.yaml) uses some environment variables.

### .env file 
[example.env](example.env) is what your .env file can look like. It contains all the environment variables that needs to be defined.
**MONGO_CONNECTION_URL** should be copied as is. It is formatted to work dependent on the values of the other environment variables.  All the other ones can have their values changed. 

**MONGO_ROOT_USERNAME** and **MONGO_ROOT_PASSWORD** don't matter as it simply set the root username and password for the mongo container that this application runs and connects to. This application doesn't connect to the mongodb cloud but rather runs a local version from the docker image.
**MONGO_CONTAINER_NAME** also doesn't matter as it simply affects the container name of the docker container that is run.

**GRAPHQL_PORT** is the port number that the graphql server will run on. You should choose a port that isn't already in use.