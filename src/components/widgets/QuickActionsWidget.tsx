import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, UserPlus, ShoppingCart, Scissors } from '@phosphor-icons/react'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'settings'

interface QuickActionsWidgetProps {
  onNavigate: (view: View) => void
}

export function QuickActionsWidget({ onNavigate }: QuickActionsWidgetProps) {
  const actions = [
    {
      label: 'New Appointment',
      icon: Calendar,
      onClick: () => onNavigate('appointments'),
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      label: 'Add Customer',
      icon: UserPlus,
      onClick: () => onNavigate('customers'),
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      label: 'Point of Sale',
      icon: ShoppingCart,
      onClick: () => onNavigate('pos'),
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      label: 'Manage Services',
      icon: Scissors,
      onClick: () => onNavigate('inventory'),
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    }
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className={`h-20 flex flex-col gap-2 ${action.color}`}
                onClick={action.onClick}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
