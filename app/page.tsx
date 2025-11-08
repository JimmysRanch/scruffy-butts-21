'use client'

import { ErrorBoundary } from "react-error-boundary"
import App from '@/App'
import { ErrorFallback } from '@/ErrorFallback'
import { SparkProvider } from '@/components/SparkProvider'

export default function HomePage() {
  return (
    <SparkProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App />
      </ErrorBoundary>
    </SparkProvider>
  )
}
