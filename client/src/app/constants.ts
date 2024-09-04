export const MATCHMAKING_PORT: number = Number(process.env.NEXT_PUBLIC_MATCHMAKING_PORT || '10001')
const GRAPHQL_PORT: number = Number(process.env.NEXT_PUBLIC_GRAPHQL_PORT || '10000')

/** The uri for the graphql server */
export const GRAPHQL_URI: string = `http://localhost:${GRAPHQL_PORT}/graphql`

export const CLIENT_PORT: number = Number(process.env.NEXT_PUBLIC_CLIENT_PORT || '3000')