import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus } from '@phosphor-icons/react'

export function PurchaseOrders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create PO
        </Button>
      </div>

      <Card className="frosted p-8 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Purchase Orders</h3>
        <p className="text-muted-foreground mb-4">
          Create purchase orders to track supply orders and link to inventory
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create PO
        </Button>
      </Card>
    </div>
  )
}
