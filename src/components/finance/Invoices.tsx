import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, Plus, Eye, Download } from '@phosphor-icons/react'
import { mockInvoices } from '@/data/finance/mockData'
import type { Invoice } from '@/data/finance/types'
import { format } from 'date-fns'

export function Invoices() {
  // TODO: Replace with API call - const { data: invoices } = useQuery('invoices', fetchInvoices)
  const [invoices] = useState<Invoice[]>(mockInvoices)

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500'
      case 'sent':
        return 'bg-blue-500/20 text-blue-500'
      case 'overdue':
        return 'bg-red-500/20 text-red-500'
      case 'draft':
        return 'bg-gray-500/20 text-gray-500'
      case 'cancelled':
        return 'bg-orange-500/20 text-orange-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getStatusLabel = (status: Invoice['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Invoices</h3>
          <div className="text-3xl font-bold">{invoices.length}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Outstanding Amount</h3>
          <div className="text-3xl font-bold">${totalOutstanding.toFixed(2)}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Overdue Invoices</h3>
          <div className="text-3xl font-bold text-red-500">{overdueCount}</div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="frosted p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Invoice #</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="p-3">{invoice.customerName}</td>
                  <td className="p-3 text-sm">{format(new Date(invoice.date), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-sm">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-right font-medium">${invoice.amount.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" weight="duotone" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" weight="duotone" />
                      </Button>
                    </div>
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
