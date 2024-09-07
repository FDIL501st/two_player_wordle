'use client'

import {Children} from "@/app/types";
import {ApolloProvider} from "@apollo/client";
import client from "@/app/apollo-client";

const ApolloClientProvider = ({children}: Children) => {
  return(
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}

export default ApolloClientProvider