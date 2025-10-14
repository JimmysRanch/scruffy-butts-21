import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, ChartBar } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface Appointment {
  id: string
  date: string
  status: string
}

interface Customer {
  id: string
}

interface StatsWidgetProps {
  type: 'today' | 'customers' | 'week'
  onClick?: () => void
}

export function StatsWidget({ type, onClick }: StatsWidgetProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  
  const today = format(new Date(), 'yyyy-MM-dd')

  const getStats = () => {
    switch (type) {
      case 'today':
        return {
          title: "Today's Appointments",
          value: (appointments || []).filter(apt => apt.date && apt.date === today).length,
          icon: Calendar,
        }
      case 'customers':
        return {
          title: "Total Customers",
          value: (customers || []).length,
          icon: Users,
        }
      case 'week':
        return {
          title: "This Week",
          value: (appointments || []).filter(apt => {
            if (!apt.date) return false
            try {
              const aptDate = new Date(apt.date)
              aptDate.setHours(0, 0, 0, 0)
              
              const weekStart = new Date()
              weekStart.setHours(0, 0, 0, 0)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay())
              
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekStart.getDate() + 6)
              weekEnd.setHours(23, 59, 59, 999)
              
              return aptDate >= weekStart && aptDate <= weekEnd
            } catch {
              return false
            }
          }).length,
          icon: ChartBar,
        }
    }
  }

  const stats = getStats()
  const Icon = stats.icon

  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stats.title}</CardTitle>
        <Icon size={20} className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.value}</div>
      </CardContent>
    </Card>
  )
}
