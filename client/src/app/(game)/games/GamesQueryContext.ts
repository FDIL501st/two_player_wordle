import { createContext } from 'react';
import { GetGamesQueryResult } from "@/(game)/types";


const initialResult: GetGamesQueryResult = {
  loading: true,
  error: undefined,
  data: undefined,
};

const GamesQueryContext = createContext<GetGamesQueryResult>(initialResult);
export default GamesQueryContext
