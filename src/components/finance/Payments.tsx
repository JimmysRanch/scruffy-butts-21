import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Download } from '@phosphor-icons/react'

export function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" weight="bold" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Payout</h3>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">No payouts scheduled</p>
        </Card>

        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Processor Fees (MTD)</h3>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">No fees recorded</p>
        </Card>
      </div>

      <Card className="frosted p-8 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
        <p className="text-muted-foreground">
          Payment records and payout history will appear here
        </p>
      </Card>
    </div>
  )
}
