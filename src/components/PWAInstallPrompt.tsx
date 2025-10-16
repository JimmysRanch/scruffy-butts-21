import { useState } from 'react'
import { X, Download } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setIsDismissed(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  if (!isInstallable || isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <Card className="glass p-6 shadow-xl border-2 border-white/40">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Install Scruffy Butts
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this app to your home screen for quick access and a better experience.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="liquid-glow"
                >
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                >
                  Not Now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
