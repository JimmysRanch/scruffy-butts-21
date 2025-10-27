import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Download, ArrowRight } from '@phosphor-icons/react'
import { mockPayouts, mockProcessorFees } from '@/data/finance/mockData'
import type { Payout, ProcessorFee } from '@/data/finance/types'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip } from 'recharts'

export function Payments() {
  // TODO: Replace with API calls
  // const { data: payouts } = useQuery('payouts', fetchPayouts)
  // const { data: fees } = useQuery('processorFees', fetchProcessorFees)
  const [payouts] = useState<Payout[]>(mockPayouts)
  const [processorFees] = useState<ProcessorFee[]>(mockProcessorFees)

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500'
      case 'processing':
        return 'bg-blue-500/20 text-blue-500'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'failed':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  const nextPayout = payouts.find(p => p.status === 'pending')
  const totalFees = processorFees.reduce((sum, fee) => sum + fee.feeAmount, 0)
  const completedPayouts = payouts.filter(p => p.status === 'completed')

  // Fee breakdown for pie chart
  const feeBreakdown = useMemo(() => {
    return [
      { name: 'Card Processing', value: totalFees * 0.85, color: '#6366f1' },
      { name: 'Transfer Fees', value: totalFees * 0.10, color: '#8b5cf6' },
      { name: 'Other Fees', value: totalFees * 0.05, color: '#ec4899' }
    ]
  }, [totalFees])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" weight="bold" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Payout</h3>
          <div className="text-2xl font-bold">
            {nextPayout ? `$${nextPayout.net.toFixed(2)}` : '$0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {nextPayout 
              ? `Expected ${format(new Date(nextPayout.expectedDate), 'MMM d, yyyy')}`
              : 'No payouts scheduled'
            }
          </p>
        </Card>

        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Processor Fees (MTD)</h3>
          <div className="text-2xl font-bold">${totalFees.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">{processorFees.length} transactions</p>
        </Card>
      </div>

      {/* Upcoming Payouts */}
      {nextPayout && (
        <Card className="frosted p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Payout</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gross Amount</span>
              <span className="font-medium">${nextPayout.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Fees</span>
              <span className="font-medium text-red-500">-${nextPayout.fees.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Payout</span>
                <span className="text-xl font-bold text-green-500">${nextPayout.net.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className={getStatusColor(nextPayout.status)}>
                {nextPayout.status.charAt(0).toUpperCase() + nextPayout.status.slice(1)}
              </Badge>
              <ArrowRight className="w-4 h-4" weight="bold" />
              <span>{nextPayout.paymentMethod}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Processor Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="frosted p-6">
          <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={feeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {feeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="frosted p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Fees</h3>
          <div className="space-y-3">
            {processorFees.slice(0, 5).map((fee) => (
              <div key={fee.id} className="flex justify-between items-center pb-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{format(new Date(fee.date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground">Transaction: ${fee.amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-500">${fee.feeAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{fee.feePercentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">Payout History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Expected</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Gross</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Fees</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Net</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Method</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 text-sm">{format(new Date(payout.date), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-sm">{format(new Date(payout.expectedDate), 'MMM d, yyyy')}</td>
                  <td className="p-3 text-right font-medium">${payout.amount.toFixed(2)}</td>
                  <td className="p-3 text-right text-red-500">${payout.fees.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-green-500">${payout.net.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(payout.status)}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{payout.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
