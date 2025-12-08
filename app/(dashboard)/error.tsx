'use client'

import { useEffect } from 'react'
import { PageError } from '@/components/error-boundary'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error)
  }, [error])

  return <PageError error={error} reset={reset} />
}
