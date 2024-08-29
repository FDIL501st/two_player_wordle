'use server'

// TODO: need to get these values from an env variable
export const MATCHMAKING_PORT: number = process.env.MATCHMAKING_PORT

const GRAPHQL_PORT: number = process.env.GRAPHQL_PORT

/** The uri for the graphql server */
export const GRAPHQL_URI: string = `http://localhost:${GRAPHQL_PORT}/graphql`