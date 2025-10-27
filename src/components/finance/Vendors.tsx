import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users as UsersIcon, Plus } from '@phosphor-icons/react'

export function Vendors() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-primary" weight="duotone" />
            Vendors
          </h2>
          <p className="text-muted-foreground mt-1">Manage vendor directory and payment terms</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Vendor
        </Button>
      </div>

      <Card className="frosted p-8 text-center">
        <UsersIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">No Vendors Added</h3>
        <p className="text-muted-foreground mb-4">
          Add vendors to track suppliers and manage payment terms
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Vendor
        </Button>
      </Card>
    </div>
  )
}
