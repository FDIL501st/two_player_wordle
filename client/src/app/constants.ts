export const MATCHMAKING_PORT: number = Number(process.env.MATCHMAKING_PORT)
const GRAPHQL_PORT: number = Number(process.env.GRAPHQL_PORT)

/** The uri for the graphql server */
export const GRAPHQL_URI: string = `http://localhost:${GRAPHQL_PORT}/graphql`