const GRAPHQL_PORT: number = Number(process.env.NEXT_PUBLIC_GRAPHQL_PORT || '10000')
const WORD_PORT: number = Number(process.env.NEXT_PUBLIC_WORD_PORT || '10002')

/** The uri for the graphql server */
export const GRAPHQL_URI: string = `http://localhost:${GRAPHQL_PORT}/graphql`

export const CLIENT_PORT: number = Number(process.env.NEXT_PUBLIC_CLIENT_PORT || '3000')

export const MATCHMAKING_PORT: number = Number(process.env.NEXT_PUBLIC_MATCHMAKING_PORT || '10001')

export const WORD_INDEX_URL: string = `http://localhost:${WORD_PORT}`