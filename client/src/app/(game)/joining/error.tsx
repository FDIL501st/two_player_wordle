'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import {useRouter} from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({error, reset}: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <br/>
      <button
        onClick={
          // back to home
          () => router.push('/')
        }
      >
        Go Back to Home
      </button>
    </div>
  )
}