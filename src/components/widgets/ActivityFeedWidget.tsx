import { useKV } from '@/lib/useKV'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scissors, CreditCard, Calendar, UserPlus, Package } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface Transaction {
  id: string
  customerId?: string
  items: { service: { name: string }; quantity: number }[]
  total: number
  paymentMethod: 'cash' | 'card'
  timestamp: Date | string
}

interface Appointment {
  id: string
  petName: string
  customerFirstName: string
  customerLastName: string
  service: string
  status: 'scheduled' | 'completed' | 'cancelled'
  date: string
  time: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
}

interface ActivityItem {
  id: string
  type: 'transaction' | 'appointment' | 'customer'
  message: string
  detail?: string
  timestamp: Date
  icon: typeof Scissors
  color: string
}

interface ActivityFeedWidgetProps {
  isCompact?: boolean
}

export function ActivityFeedWidget({ isCompact = false }: ActivityFeedWidgetProps) {
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])

  const getActivityFeed = (): ActivityItem[] => {
    const activities: ActivityItem[] = []

    if (transactions) {
      transactions.slice(-10).reverse().forEach(transaction => {
        try {
          const customer = customers?.find(c => c.id === transaction.customerId)
          const customerName = customer 
            ? `${customer.firstName} ${customer.lastName}`
            : 'Walk-in customer'
          
          const serviceName = transaction.items[0]?.service?.name || 'service'
          
          const timestamp = new Date(transaction.timestamp)
          if (isNaN(timestamp.getTime())) {
            return
          }
          
          activities.push({
            id: `transaction-${transaction.id}`,
            type: 'transaction',
            message: `${customerName} checked out`,
            detail: `${serviceName} - $${transaction.total.toFixed(2)} (${transaction.paymentMethod})`,
            timestamp,
            icon: CreditCard,
            color: 'text-green-600'
          })
        } catch {
        }
      })
    }

    if (appointments) {
      appointments
        .filter(apt => apt.status === 'completed')
        .slice(-10)
        .reverse()
        .forEach(appointment => {
          try {
            if (!appointment.date || !appointment.time) return
            
            const timestamp = new Date(`${appointment.date}T${appointment.time}`)
            if (isNaN(timestamp.getTime())) {
              return
            }
            
            activities.push({
              id: `appointment-${appointment.id}`,
              type: 'appointment',
              message: `${appointment.petName}'s grooming completed`,
              detail: `${appointment.customerFirstName} ${appointment.customerLastName} - ${appointment.service}`,
              timestamp,
              icon: Scissors,
              color: 'text-blue-600'
            })
          } catch {
          }
        })
    }

    if (customers) {
      customers
        .slice(-5)
        .reverse()
        .forEach(customer => {
          activities.push({
            id: `customer-${customer.id}`,
            type: 'customer',
            message: 'New customer added',
            detail: `${customer.firstName} ${customer.lastName}`,
            timestamp: new Date(),
            icon: UserPlus,
            color: 'text-purple-600'
          })
        })
    }

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 15)
  }

  const activities = getActivityFeed()

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions and updates from your team
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {activities.length === 0 ? (
          <p className={`text-muted-foreground text-center ${isCompact ? 'py-4' : 'py-8'}`}>
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className={`p-2 rounded-lg bg-secondary ${activity.color}`}>
                    <Icon size={18} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.message}</p>
                    {activity.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
