import { CurrencyDollar } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

export function Finances() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CurrencyDollar className="w-8 h-8 text-primary" weight="duotone" />
          Finances
        </h1>
        <p className="text-muted-foreground mt-1">Financial management and insights</p>
      </div>

      <Card className="frosted p-6">
        <p className="text-muted-foreground">Finances module coming soon...</p>
      </Card>
    </div>
  )
}
