import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, Plus } from '@phosphor-icons/react'

export function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" weight="duotone" />
            Invoices
          </h2>
          <p className="text-muted-foreground mt-1">Manage customer invoices and billing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create Invoice
        </Button>
      </div>

      <Card className="frosted p-8 text-center">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first invoice to start tracking customer billing
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create Invoice
        </Button>
      </Card>
    </div>
  )
}
