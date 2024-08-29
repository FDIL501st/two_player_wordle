'use client'

import { ApolloProvider } from '@apollo/client';
import React from "react";
import client from "@app/apollo-client";


type Children = Readonly<{ children: React.ReactNode }>

function GameLayout({children}: Children) {
  return (
    <ApolloProvider client={client}>
      <div>
        {children}
      </div>
    </ApolloProvider>
  );
}

export default GameLayout