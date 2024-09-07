import {Children} from "@/app/types";
import ApolloClientProvider from "@/app/ApolloClientProvider";
import GameSessionProvider from "@/(game)/GameSessionProvider";


function GameLayout({children}: Children) {
  return (
    <ApolloClientProvider>
      <GameSessionProvider>
        {children}
      </GameSessionProvider>
    </ApolloClientProvider>
  );
}

export default GameLayout