import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Download } from '@phosphor-icons/react'

export function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" weight="bold" />
          Export Summaries
        </Button>
      </div>

      <Card className="frosted p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Payroll Run</h3>
        <div className="text-2xl font-bold">Not Scheduled</div>
        <p className="text-xs text-muted-foreground mt-1">Set up your first payroll period</p>
      </Card>

      <Card className="frosted p-8 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Payroll Records</h3>
        <p className="text-muted-foreground mb-4">
          Configure payroll settings to start tracking employee compensation
        </p>
        <Button>Configure Payroll</Button>
      </Card>
    </div>
  )
}
