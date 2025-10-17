import { useKV } from '@github/spark/hooks'
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
    <div className="border border-border/50 rounded-xl overflow-hidden @container min-w-0 shadow-sm bg-gradient-to-br from-card to-card/95">
      <div className="bg-gradient-to-r from-accent via-accent to-accent/90 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <ClockCounterClockwise className="h-5 w-5 text-accent-foreground" weight="duotone" />
          <h3 className="font-bold text-sm text-accent-foreground tracking-wide">Recent Activity</h3>
        </div>
      </div>
      <div className="px-5 py-5">
        {recentActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-fit mx-auto p-5 rounded-2xl mb-4 bg-secondary/50 ring-1 ring-border/30">
              <ClockCounterClockwise className="h-12 w-12 opacity-40 text-muted-foreground" weight="duotone" />
            </div>
            <p className="text-sm font-medium">No recent activity to display</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="rounded-xl border border-border/50 hover:border-accent/30 hover:shadow-sm transition-all duration-200 p-3.5 min-w-0 bg-gradient-to-br from-secondary/30 to-secondary/10"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${getActivityColor(activity.type)} border ring-1 ring-current/10`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-xs truncate">{activity.action}</p>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0 whitespace-nowrap font-semibold">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1 font-medium">{activity.details}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">by {activity.staffName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
