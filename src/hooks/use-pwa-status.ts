import { useState, useEffect } from 'react'

export function usePWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = (window.navigator as any).standalone === true
    setIsStandalone(standalone || iosStandalone)

    const ua = window.navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream)
    setIsAndroid(/Android/.test(ua))
  }, [])

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isPWA: isStandalone
  }
}
