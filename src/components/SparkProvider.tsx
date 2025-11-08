'use client'

import { useEffect } from 'react'

export function SparkProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import('@github/spark/spark')
  }, [])

  return <>{children}</>
}
