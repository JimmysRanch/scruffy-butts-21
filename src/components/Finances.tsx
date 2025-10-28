import { useState } from 'react'
import { 
  CurrencyDollar, 
  Receipt, 
  TrendUp, 
  Wallet,
  Users as UsersIcon,
  FileText,
  ShoppingCart,
  Percent,
  ChartBar
} from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinanceDashboard } from '@/components/finance/FinanceDashboard'
import { Invoices } from '@/components/finance/Invoices'
import { Expenses } from '@/components/finance/Expenses'
import { Payments } from '@/components/finance/Payments'
import { Payroll } from '@/components/finance/Payroll'
import { Taxes } from '@/components/finance/Taxes'
import { Vendors } from '@/components/finance/Vendors'
import { PurchaseOrders } from '@/components/finance/PurchaseOrders'

export function Finances() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="frosted flex-wrap h-auto">
          <TabsTrigger value="dashboard">
            <ChartBar className="w-4 h-4 mr-2 text-cyan-400" weight="duotone" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="w-4 h-4 mr-2 text-green-400" weight="duotone" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <TrendUp className="w-4 h-4 mr-2 text-red-400" weight="duotone" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Wallet className="w-4 h-4 mr-2 text-emerald-400" weight="duotone" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <UsersIcon className="w-4 h-4 mr-2 text-blue-400" weight="duotone" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="taxes">
            <Percent className="w-4 h-4 mr-2 text-amber-400" weight="duotone" />
            Taxes
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <UsersIcon className="w-4 h-4 mr-2 text-purple-400" weight="duotone" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <ShoppingCart className="w-4 h-4 mr-2 text-orange-400" weight="duotone" />
            Purchase Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboard onNavigateToTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="invoices">
          <Invoices />
        </TabsContent>

        <TabsContent value="expenses">
          <Expenses />
        </TabsContent>

        <TabsContent value="payments">
          <Payments />
        </TabsContent>

        <TabsContent value="payroll">
          <Payroll />
        </TabsContent>

        <TabsContent value="taxes">
          <Taxes />
        </TabsContent>

        <TabsContent value="vendors">
          <Vendors />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <PurchaseOrders />
        </TabsContent>
      </Tabs>
    </div>
  )
}
