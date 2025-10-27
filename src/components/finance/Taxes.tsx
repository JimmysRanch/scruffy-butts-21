import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Percent,
  Download,
  CheckCircle,
  Warning,
  CalendarBlank,
  FileText
} from '@phosphor-icons/react'
import { format, startOfQuarter, endOfQuarter, differenceInDays, addMonths } from 'date-fns'

interface Transaction {
  id: string
  date: string
  tax: number
  total: number
}

interface TaxQuarter {
  quarter: string
  year: number
  startDate: Date
  endDate: Date
  dueDate: Date
  collected: number
  remitted: number
  status: 'Not Started' | 'Ready' | 'Submitted' | 'Late'
}

export function Taxes() {
  const [transactions = []] = useKV<Transaction[]>('transactions', [])
  const [taxRemittances = []] = useKV<any[]>('tax-remittances', [])

  const currentQuarter = useMemo(() => {
    const now = new Date()
    const quarterStart = startOfQuarter(now)
    const quarterEnd = endOfQuarter(now)
    const dueDate = addMonths(quarterEnd, 1)
    
    const quarterNum = Math.floor(now.getMonth() / 3) + 1
    const year = now.getFullYear()

    const quarterTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= quarterStart && date <= quarterEnd
    })

    const collected = quarterTransactions.reduce((sum, t) => sum + (t.tax || 0), 0)
    const remitted = taxRemittances
      .filter(r => new Date(r.date) >= quarterStart && new Date(r.date) <= quarterEnd)
      .reduce((sum, r) => sum + r.amount, 0)

    const daysUntilDue = differenceInDays(dueDate, now)
    
    let status: TaxQuarter['status'] = 'Not Started'
    if (remitted >= collected) {
      status = 'Submitted'
    } else if (daysUntilDue < 0) {
      status = 'Late'
    } else if (collected > 0) {
      status = 'Ready'
    }

    return {
      quarter: `Q${quarterNum}`,
      year,
      startDate: quarterStart,
      endDate: quarterEnd,
      dueDate,
      collected,
      remitted,
      status,
      daysUntilDue
    }
  }, [transactions, taxRemittances])

  const quarters = useMemo(() => {
    const now = new Date()
    const result: TaxQuarter[] = []
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1)
      const quarterStart = startOfQuarter(date)
      const quarterEnd = endOfQuarter(date)
      const dueDate = addMonths(quarterEnd, 1)
      
      const quarterNum = Math.floor(date.getMonth() / 3) + 1
      const year = date.getFullYear()

      const quarterTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate >= quarterStart && tDate <= quarterEnd
      })

      const collected = quarterTransactions.reduce((sum, t) => sum + (t.tax || 0), 0)
      const remitted = taxRemittances
        .filter(r => new Date(r.date) >= quarterStart && new Date(r.date) <= quarterEnd)
        .reduce((sum, r) => sum + r.amount, 0)

      const daysUntilDue = differenceInDays(dueDate, now)
      
      let status: TaxQuarter['status'] = 'Not Started'
      if (remitted >= collected) {
        status = 'Submitted'
      } else if (daysUntilDue < 0) {
        status = 'Late'
      } else if (collected > 0) {
        status = 'Ready'
      }

      result.push({
        quarter: `Q${quarterNum}`,
        year,
        startDate: quarterStart,
        endDate: quarterEnd,
        dueDate,
        collected,
        remitted,
        status
      })
    }
    
    return result
  }, [transactions, taxRemittances])

  const getStatusColor = (status: TaxQuarter['status']) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-500/20 text-green-500'
      case 'Ready':
        return 'bg-blue-500/20 text-blue-500'
      case 'Late':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" weight="duotone" />
            Sales Tax Compliance
          </h2>
          <p className="text-muted-foreground mt-1">Track and manage quarterly sales tax filings</p>
        </div>
      </div>

      {/* Current Quarter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">QTD Collected</h3>
            <div className="text-3xl font-bold text-foreground">
              ${currentQuarter.collected.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentQuarter.quarter} {currentQuarter.year}
            </p>
          </div>
        </Card>

        <Card className="frosted p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Next Due Date</h3>
            <div className="text-2xl font-bold text-foreground">
              {format(currentQuarter.dueDate, 'MMM d, yyyy')}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentQuarter.daysUntilDue > 0 
                ? `${currentQuarter.daysUntilDue} days remaining`
                : `${Math.abs(currentQuarter.daysUntilDue)} days overdue`
              }
            </p>
          </div>
        </Card>

        <Card className="frosted p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Quarter Status</h3>
            <Badge className={getStatusColor(currentQuarter.status)}>
              {currentQuarter.status}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Remitted: ${currentQuarter.remitted.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filing Due Date Countdown */}
      {currentQuarter.status !== 'Submitted' && currentQuarter.daysUntilDue < 30 && (
        <Card className="frosted p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Warning className="w-6 h-6 text-yellow-500" weight="duotone" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Sales tax filing due in {currentQuarter.daysUntilDue} days
              </p>
              <p className="text-xs text-muted-foreground">
                Q{currentQuarter.quarter} {currentQuarter.year} tax return due {format(currentQuarter.dueDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button>
          <FileText className="w-4 h-4 mr-2" weight="duotone" />
          Prepare Filing
        </Button>
        <Button variant="outline">
          <CheckCircle className="w-4 h-4 mr-2" weight="duotone" />
          Mark Submitted
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" weight="duotone" />
          Export Reports
        </Button>
      </div>

      {/* Quarterly History Table */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">Quarterly History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Quarter</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Period</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Collected</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Remitted</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map((q) => (
                <tr key={`${q.year}-${q.quarter}`} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 font-medium">{q.quarter} {q.year}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {format(q.startDate, 'MMM d')} - {format(q.endDate, 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 text-sm">{format(q.dueDate, 'MMM d, yyyy')}</td>
                  <td className="p-3 text-right font-medium">${q.collected.toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">${q.remitted.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(q.status)}>
                      {q.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Taxable vs Non-Taxable */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">Current Quarter Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Taxable Sales</p>
            <p className="text-2xl font-bold">${currentQuarter.collected.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Non-Taxable Sales</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
