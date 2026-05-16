export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  U8: { input: unknown; output: unknown; }
  U16: { input: unknown; output: unknown; }
  U32: { input: unknown; output: unknown; }
  U54: { input: unknown; output: unknown; }
};

/** A game that is currently active/being played. */
export type Game = {
  __typename: 'Game';
  /** The current round that is being played. */
  currentRound: Round;
  /** The id of a Game. Used by the database to identify each document. */
  id: Scalars['String']['output'];
  /** The points of player 1. */
  p1Points: Scalars['U32']['output'];
  /** The points of player 2. */
  p2Points: Scalars['U32']['output'];
  /**
   * The current round number that is currently being made.
   * This value starts at 1.
   */
  roundNum: Scalars['U16']['output'];
};

export type Mutation = {
  __typename: 'Mutation';
  /** Adds a turn to the round in the database. */
  addTurn: Scalars['Boolean']['output'];
  apiVersion: Scalars['String']['output'];
  /**
   * Creates a new game. Returns true if successful.
   *
   * # Errors
   *
   * This function will return an error if failed to create a new game.
   * Most likely cause is being unable to connect to the database.
   */
  newGame: Scalars['String']['output'];
  /**
   * Removes a game from the database.
   *
   * # Errors
   *
   * This function will return an error if failed to delete the query.
   * Most likely cause is id given not existing.
   */
  removeGame: Scalars['Boolean']['output'];
  /**
   * Removes all games from the database.
   *
   * # Errors
   *
   * This function will return an error if failed to delete the query.
   * Most likely cause is a connection error to database.
   */
  removeGames: Scalars['Boolean']['output'];
  /**
   * Testing creation of new game by providing a id instead of letting program generate one.
   * Also testing default arguments.
   */
  testNewGame: Scalars['String']['output'];
};


export type MutationAddTurnArgs = {
  roundId: Scalars['String']['input'];
  turn: NewTurn;
};


export type MutationNewGameArgs = {
  word?: Scalars['String']['input'];
};


export type MutationRemoveGameArgs = {
  id: Scalars['String']['input'];
};


export type MutationTestNewGameArgs = {
  id: Scalars['String']['input'];
  word?: Scalars['String']['input'];
};

/** A new turn made by some player. Essentially same as ```Turn```, but used for graphql arguments. */
export type NewTurn = {
  /** The word guessed by the player. */
  guess: Scalars['String']['input'];
  /**
   * The states of each letter of ```guess```.
   * Clients need to encode the letter states and the bytes are stored as an ```int```.
   */
  letterState: Scalars['U16']['input'];
};

/** The player type, either player 1 or player 2 */
export enum Player {
  /** Player 1 */
  P1 = 'P1',
  /** Player 2 */
  P2 = 'P2'
}

export type Query = {
  __typename: 'Query';
  apiVersion: Scalars['String']['output'];
  /** Get a game */
  game: Game;
  /** Get all games */
  games: Array<Game>;
};


export type QueryGameArgs = {
  id: Scalars['String']['input'];
};

/**
 * A round in a match.
 * A match can have multiple rounds
 */
export type Round = {
  __typename: 'Round';
  /** The current player whose turn it is. */
  currentPlayer: Player;
  /**
   * The current guess number the round is on.
   * Guess number starts at 0.
   */
  guessNum: Scalars['U8']['output'];
  /**
   * The state of all the letters in the round.
   * This is an encoded value, clients are responsible for encoding and decoding the bytes
   */
  letterpoolState: Scalars['U54']['output'];
  /** The target word that players are trying to guess for the round. */
  targetWord: Scalars['String']['output'];
  /**
   * A history of turns made in the round.
   * This vector can grow as the round progresses and more turns are played.
   * Does not include the current turn being played.
   */
  turns: Array<Turn>;
};

/** A turn turn made by some player. */
export type Turn = {
  __typename: 'Turn';
  /** The word guessed by the player. */
  guessedWord: Scalars['String']['output'];
  /**
   * the states of each letter of the word.
   * Clients need to decode this ```int``` to actually read the state of each letter.
   */
  letterState: Scalars['U16']['output'];
};

export type GetAllGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllGamesQuery = { games: Array<{ __typename: 'Game', id: string }> };

export type GetGameQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetGameQuery = { game: { __typename: 'Game', id: string, p1Points: unknown, p2Points: unknown, roundNum: unknown, currentRound: { __typename: 'Round', targetWord: string, letterpoolState: unknown, currentPlayer: Player, guessNum: unknown, turns: Array<{ __typename: 'Turn', guessedWord: string, letterState: unknown }> } } };

export type GetRoundQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetRoundQuery = { game: { __typename: 'Game', p1Points: unknown, p2Points: unknown, roundNum: unknown, currentRound: { __typename: 'Round', targetWord: string, letterpoolState: unknown, currentPlayer: Player, guessNum: unknown, turns: Array<{ __typename: 'Turn', guessedWord: string, letterState: unknown }> } } };

export type GetGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGamesQuery = { games: Array<{ __typename: 'Game', id: string, p1Points: unknown, p2Points: unknown, roundNum: unknown }> };
