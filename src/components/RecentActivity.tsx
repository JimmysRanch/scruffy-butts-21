import { useKV } from '@/lib/useKV'
import { Badge } from '@/components/ui/badge'
import { Activity } from '@/lib/activity-tracker'
import { 
  ClockCounterClockwise, 
  CalendarCheck, 
  User, 
  Package, 
  CurrencyDollar, 
  UsersFour,
  Scissors
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity() {
  const [activities] = useKV<Activity[]>('recent-activities', [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return <CalendarCheck size={16} weight="fill" className="text-primary drop-shadow-[0_0_6px_oklch(0.60_0.20_280)]" />
      case 'customer':
        return <User size={16} weight="fill" className="text-cyan-400 drop-shadow-[0_0_6px_oklch(0.60_0.20_200)]" />
      case 'inventory':
        return <Package size={16} weight="fill" className="text-amber-400 drop-shadow-[0_0_6px_oklch(0.60_0.20_60)]" />
      case 'sale':
        return <CurrencyDollar size={16} weight="fill" className="text-emerald-400 drop-shadow-[0_0_6px_oklch(0.60_0.20_160)]" />
      case 'staff':
        return <UsersFour size={16} weight="fill" className="text-purple-400 drop-shadow-[0_0_6px_oklch(0.60_0.20_300)]" />
      case 'service':
        return <Scissors size={16} weight="fill" className="text-pink-400 drop-shadow-[0_0_6px_oklch(0.60_0.20_340)]" />
      default:
        return <ClockCounterClockwise size={16} weight="fill" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return 'bg-primary/25 text-primary border-primary/40 shadow-[0_0_12px_oklch(0.60_0.20_280/0.3)]'
      case 'customer':
        return 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_oklch(0.60_0.20_200/0.3)]'
      case 'inventory':
        return 'bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-[0_0_12px_oklch(0.60_0.20_60/0.3)]'
      case 'sale':
        return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_oklch(0.60_0.20_160/0.3)]'
      case 'staff':
        return 'bg-purple-500/25 text-purple-300 border-purple-500/40 shadow-[0_0_12px_oklch(0.60_0.20_300/0.3)]'
      case 'service':
        return 'bg-pink-500/25 text-pink-300 border-pink-500/40 shadow-[0_0_12px_oklch(0.60_0.20_340/0.3)]'
      default:
        return 'bg-gray-500/25 text-gray-300 border-gray-500/40'
    }
  }

  const recentActivities = (activities || []).slice(0, 10)

  return (
    <>
      <div className="pb-4 pt-5 px-5">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white/90">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent/30 via-primary/30 to-accent/30 ring-1 ring-white/15 shrink-0 shadow-[0_0_12px_oklch(0.65_0.20_290)]">
            <ClockCounterClockwise className="h-5 w-5 text-accent drop-shadow-[0_0_4px_oklch(0.65_0.22_310)]" weight="duotone" />
          </div>
          <span className="truncate">Recent Activity</span>
        </h2>
        <p className="truncate text-xs font-medium text-white/50 mt-1">Latest actions by staff members</p>
      </div>
      <div className="px-5 pb-5">
        {recentActivities.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <div className="w-fit mx-auto p-5 rounded-2xl mb-4 bg-white/5 ring-1 ring-white/10">
              <ClockCounterClockwise className="h-12 w-12 opacity-40 text-white/50" weight="duotone" />
            </div>
            <p className="text-sm font-medium">No recent activity to display</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="rounded-xl border border-white/10 hover:border-accent/50 hover:bg-white/5 transition-all duration-300 p-3.5 min-w-0 backdrop-blur-sm hover:shadow-[0_0_20px_oklch(0.65_0.22_310/0.3)]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${getActivityColor(activity.type)} border ring-1 ring-current/10`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs truncate text-white/90">
                        <span className="font-semibold">{activity.action}</span> <span className="text-white/50">by {activity.staffName}</span>
                      </p>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0 whitespace-nowrap font-semibold border-white/20 text-white/70">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 truncate font-medium">{activity.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
