import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendDown, Plus } from '@phosphor-icons/react'

export function Expenses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendDown className="w-6 h-6 text-primary" weight="duotone" />
            Expenses
          </h2>
          <p className="text-muted-foreground mt-1">Track and categorize business expenses</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Expense
        </Button>
      </div>

      <Card className="frosted p-8 text-center">
        <TrendDown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Expenses Recorded</h3>
        <p className="text-muted-foreground mb-4">
          Start tracking your business expenses to monitor cash flow
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Expense
        </Button>
      </Card>
    </div>
  )
}
