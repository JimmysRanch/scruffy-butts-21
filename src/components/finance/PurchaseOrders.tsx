import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Eye, CalendarBlank } from '@phosphor-icons/react'
import { mockPurchaseOrders } from '@/data/finance/mockData'
import type { PurchaseOrder } from '@/data/finance/types'
import { format } from 'date-fns'

export function PurchaseOrders() {
  // TODO: Replace with API call - const { data: purchaseOrders } = useQuery('purchaseOrders', fetchPurchaseOrders)
  const [purchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders)

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'received':
        return 'bg-green-500/20 text-green-500'
      case 'sent':
        return 'bg-blue-500/20 text-blue-500'
      case 'draft':
        return 'bg-gray-500/20 text-gray-500'
      case 'cancelled':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  const totalOrders = purchaseOrders.length
  const outstandingOrders = purchaseOrders.filter(po => po.status === 'sent').length
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Purchase Orders</h3>
          <div className="text-3xl font-bold">{totalOrders}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Outstanding Orders</h3>
          <div className="text-3xl font-bold text-blue-500">{outstandingOrders}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Value</h3>
          <div className="text-3xl font-bold">${totalValue.toFixed(2)}</div>
        </Card>
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {purchaseOrders.map((po) => (
          <Card key={po.id} className="frosted p-6 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold">{po.poNumber}</h3>
                  <Badge className={getStatusColor(po.status)}>
                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{po.vendorName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${po.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Subtotal: ${po.subtotal.toFixed(2)} + Tax: ${po.tax.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <CalendarBlank className="w-4 h-4" weight="duotone" />
                <span>Ordered: {format(new Date(po.orderDate), 'MMM d, yyyy')}</span>
              </div>
              <span>•</span>
              <span>Expected: {format(new Date(po.expectedDate), 'MMM d, yyyy')}</span>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Items ({po.items.length})</p>
              <div className="space-y-2">
                {po.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground"> × {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">${item.total.toFixed(2)}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        (${item.unitPrice.toFixed(2)} each)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" weight="duotone" />
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Purchase Orders Table */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">All Purchase Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">PO Number</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Expected</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 font-medium">{po.poNumber}</td>
                  <td className="p-3">{po.vendorName}</td>
                  <td className="p-3 text-sm">{format(new Date(po.orderDate), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-sm">{format(new Date(po.expectedDate), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-right">{po.items.length}</td>
                  <td className="p-3 text-right font-medium">${po.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(po.status)}>
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
