import { createContext } from 'react';
import {QueryResult} from "@games/types";


const initialResult: QueryResult = {
  loading: true,
  error: undefined,
  data: undefined
}

const GamesQueryContext = createContext<QueryResult>(initialResult)
export default GamesQueryContext
