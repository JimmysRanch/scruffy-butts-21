import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Download, CalendarBlank } from '@phosphor-icons/react'
import { mockPayrollPeriods } from '@/data/finance/mockData'
import type { PayrollPeriod } from '@/data/finance/types'
import { format } from 'date-fns'

export function Payroll() {
  // TODO: Replace with API call - const { data: payrollPeriods } = useQuery('payroll', fetchPayroll)
  const [payrollPeriods] = useState<PayrollPeriod[]>(mockPayrollPeriods)

  const getStatusColor = (status: PayrollPeriod['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500'
      case 'processing':
        return 'bg-blue-500/20 text-blue-500'
      case 'draft':
        return 'bg-gray-500/20 text-gray-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  const nextPayroll = payrollPeriods.find(p => p.status === 'draft')
  const lastPayroll = payrollPeriods.find(p => p.status === 'paid')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" weight="bold" />
          Export Summaries
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Payroll Run</h3>
          <div className="text-2xl font-bold">
            {nextPayroll ? format(new Date(nextPayroll.payDate), 'MMM d, yyyy') : 'Not Scheduled'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {nextPayroll 
              ? `${format(new Date(nextPayroll.periodStart), 'MMM d')} - ${format(new Date(nextPayroll.periodEnd), 'MMM d')}`
              : 'Set up your first payroll period'
            }
          </p>
        </Card>

        {nextPayroll && (
          <>
            <Card className="frosted p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Gross + Tips</h3>
              <div className="text-2xl font-bold">${(nextPayroll.totalGross + nextPayroll.totalTips).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Gross: ${nextPayroll.totalGross.toFixed(2)} | Tips: ${nextPayroll.totalTips.toFixed(2)}
              </p>
            </Card>

            <Card className="frosted p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Payout</h3>
              <div className="text-2xl font-bold text-green-500">${nextPayroll.totalNet.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{nextPayroll.employees.length} employees</p>
            </Card>
          </>
        )}
      </div>

      {/* Next Payroll Details */}
      {nextPayroll && (
        <Card className="frosted p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Next Pay Period</h3>
            <Badge className={getStatusColor(nextPayroll.status)}>
              {nextPayroll.status.charAt(0).toUpperCase() + nextPayroll.status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <CalendarBlank className="w-4 h-4" weight="duotone" />
            <span>
              {format(new Date(nextPayroll.periodStart), 'MMM d, yyyy')} - {format(new Date(nextPayroll.periodEnd), 'MMM d, yyyy')}
            </span>
            <span className="mx-2">•</span>
            <span>Pay Date: {format(new Date(nextPayroll.payDate), 'MMM d, yyyy')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Hours</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Gross</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Tips</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Deductions</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {nextPayroll.employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="p-3 font-medium">{employee.name}</td>
                    <td className="p-3 text-right">{employee.hours || 0}</td>
                    <td className="p-3 text-right">${(employee.hourlyRate || 0).toFixed(2)}</td>
                    <td className="p-3 text-right">${(employee.gross || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-green-500">${(employee.tips || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-red-500">${(employee.deductions || 0).toFixed(2)}</td>
                    <td className="p-3 text-right font-bold">${(employee.net || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">{nextPayroll.employees.reduce((sum, e) => sum + e.hours, 0)}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right">${nextPayroll.totalGross.toFixed(2)}</td>
                  <td className="p-3 text-right text-green-500">${nextPayroll.totalTips.toFixed(2)}</td>
                  <td className="p-3 text-right text-red-500">
                    ${nextPayroll.employees.reduce((sum, e) => sum + e.deductions, 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">${nextPayroll.totalNet.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Payroll History */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">Payroll History</h3>
        <div className="space-y-4">
          {payrollPeriods.map((period) => (
            <div key={period.id} className="border border-border rounded-lg p-4 hover:bg-white/5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">
                    {format(new Date(period.periodStart), 'MMM d')} - {format(new Date(period.periodEnd), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">Pay Date: {format(new Date(period.payDate), 'MMM d, yyyy')}</p>
                </div>
                <Badge className={getStatusColor(period.status)}>
                  {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employees</p>
                  <p className="font-medium">{period.employees.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gross</p>
                  <p className="font-medium">${period.totalGross.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tips</p>
                  <p className="font-medium text-green-500">${period.totalTips.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Net</p>
                  <p className="font-medium">${period.totalNet.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
