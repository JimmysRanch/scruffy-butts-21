import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from '@/lib/activity-tracker'
import { 
  ClockCounterClockwise, 
  CalendarCheck, 
  User, 
  Package, 
  ShoppingCart, 
  UsersFour,
  Scissors
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity() {
  const [activities] = useKV<Activity[]>('recent-activities', [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return <CalendarCheck size={16} weight="fill" className="text-primary" />
      case 'customer':
        return <User size={16} weight="fill" className="text-emerald-600" />
      case 'inventory':
        return <Package size={16} weight="fill" className="text-amber-600" />
      case 'sale':
        return <ShoppingCart size={16} weight="fill" className="text-blue-600" />
      case 'staff':
        return <UsersFour size={16} weight="fill" className="text-purple-600" />
      case 'service':
        return <Scissors size={16} weight="fill" className="text-pink-600" />
      default:
        return <ClockCounterClockwise size={16} weight="fill" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'customer':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      case 'inventory':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
      case 'sale':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
      case 'staff':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
      case 'service':
        return 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30'
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
    }
  }

  const recentActivities = (activities || []).slice(0, 10)

  return (
    <Card className="frosted border-white/20 @container min-w-0">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="glass-dark p-1.5 rounded-lg shrink-0">
            <ClockCounterClockwise className="h-4 w-4" weight="fill" />
          </div>
          <span className="truncate">Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 px-4 pb-4">
        {recentActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="glass-dark w-fit mx-auto p-4 rounded-2xl mb-3">
              <ClockCounterClockwise className="h-10 w-10 opacity-50" weight="fill" />
            </div>
            <p className="text-sm">No recent activity to display</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="glass-dark rounded-lg border border-white/20 hover:glass transition-all duration-200 p-3 min-w-0"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`glass-dark p-1.5 rounded-lg shrink-0 ${getActivityColor(activity.type)} border`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="font-medium text-xs truncate">{activity.action}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-0.5">{activity.details}</p>
                    <p className="text-[10px] text-muted-foreground">by {activity.staffName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
