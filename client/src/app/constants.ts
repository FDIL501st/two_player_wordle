// TODO: need to get these values from an env variable
const MATCHMAKING_PORT: number = 10001
const GRAPHQL_PORT: number = 10000

/** The uri for requesting any mutations from the graphql server */
const GRAPHQL_MUTATION_URI: string = `http://localhost:${GRAPHQL_PORT}/graphql`

/**
 * Generates the http GET request to make a graphql query.
 * @param query The graphql query to execute
 */
function generate_graphql_query_request(query: string): string {
  return `http://localhost:${GRAPHQL_PORT}/graphql?query=${query}`
}

export {
  MATCHMAKING_PORT,
  GRAPHQL_PORT,
  GRAPHQL_MUTATION_URI,
  generate_graphql_query_request
}