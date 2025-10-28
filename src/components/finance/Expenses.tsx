import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendDown, Plus, Receipt } from '@phosphor-icons/react'
import { mockExpenses } from '@/data/finance/mockData'
import type { Expense } from '@/data/finance/types'
import { format } from 'date-fns'

export function Expenses() {
  // TODO: Replace with API call - const { data: expenses } = useQuery('expenses', fetchExpenses)
  const [expenses] = useState<Expense[]>(mockExpenses)

  const getStatusColor = (status: Expense['status']) => {
    return status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
  }

  const getPaymentMethodLabel = (method: Expense['paymentMethod']) => {
    const labels = {
      cash: 'Cash',
      card: 'Card',
      check: 'Check',
      transfer: 'Transfer'
    }
    return labels[method]
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0)
  const paidExpenses = expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0)

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = 0
    }
    acc[exp.category] += exp.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</h3>
          <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Paid</h3>
          <div className="text-3xl font-bold text-green-500">${paidExpenses.toFixed(2)}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending</h3>
          <div className="text-3xl font-bold text-yellow-500">${pendingExpenses.toFixed(2)}</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="space-y-1">
              <p className="text-sm text-muted-foreground">{category}</p>
              <p className="text-xl font-bold">${amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="frosted p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 text-sm">{format(new Date(expense.date), 'MMM d, yyyy')}</td>
                  <td className="p-3">
                    <Badge variant="outline">{expense.category}</Badge>
                  </td>
                  <td className="p-3 text-sm">{expense.vendor}</td>
                  <td className="p-3 text-sm text-muted-foreground">{expense.description}</td>
                  <td className="p-3 text-right font-medium">${expense.amount.toFixed(2)}</td>
                  <td className="p-3 text-center text-sm">{getPaymentMethodLabel(expense.paymentMethod)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
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
