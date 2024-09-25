'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store'
import {Children} from "@/app/types";

export default function StoreProvider({children}: Children) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }
  // this is essentially singleton pattern

  // noinspection TypeScriptValidateTypes
  return (
    <Provider store={storeRef.current}>
      {children}
    </Provider>
  )
}