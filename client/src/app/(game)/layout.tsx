import {Children} from "@app/types";
import ApolloClientProvider from "@app/ApolloClientProvider";


function GameLayout({children}: Children) {
  return (
    <ApolloClientProvider>
      {children}
    </ApolloClientProvider>
  );
}

export default GameLayout