import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Calendar, Users, ChartBar, Plus, Activity, TrendUp, Lightning, Sliders } from '@phosphor-icons/react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { TodayScheduleWidget } from '@/components/widgets/TodayScheduleWidget'
import { UpcomingAppointmentsWidget } from '@/components/widgets/UpcomingAppointmentsWidget'
import { StatsWidget } from '@/components/widgets/StatsWidget'
import { ActivityFeedWidget } from '@/components/widgets/ActivityFeedWidget'
import { RevenueWidget } from '@/components/widgets/RevenueWidget'
import { QuickActionsWidget } from '@/components/widgets/QuickActionsWidget'
import { WidgetConfiguration, WidgetConfig } from '@/components/WidgetConfiguration'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'settings'

interface DashboardProps {
  onNavigate: (view: View) => void
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'stats-today',
    name: "Today's Appointments",
    description: 'Quick count of appointments scheduled for today',
    icon: Calendar,
    enabled: true,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'stats-customers',
    name: 'Total Customers',
    description: 'Total number of customers in your system',
    icon: Users,
    enabled: true,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'stats-week',
    name: 'This Week',
    description: 'Appointments scheduled for this week',
    icon: ChartBar,
    enabled: true,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'today-schedule',
    name: "Today's Schedule",
    description: 'Detailed list of today\'s appointments',
    icon: Calendar,
    enabled: true,
    defaultSize: { w: 6, h: 4 }
  },
  {
    id: 'upcoming',
    name: 'Upcoming Appointments',
    description: 'Next scheduled appointments',
    icon: Calendar,
    enabled: true,
    defaultSize: { w: 6, h: 4 }
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    description: 'Real-time activity from your team',
    icon: Activity,
    enabled: true,
    defaultSize: { w: 6, h: 5 }
  },
  {
    id: 'revenue-today',
    name: "Today's Revenue",
    description: 'Revenue generated today',
    icon: TrendUp,
    enabled: true,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'revenue-week',
    name: "Week's Revenue",
    description: 'Revenue for the current week',
    icon: TrendUp,
    enabled: false,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'revenue-month',
    name: "Month's Revenue",
    description: 'Revenue for the current month',
    icon: TrendUp,
    enabled: false,
    defaultSize: { w: 4, h: 2 }
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Fast access to common tasks',
    icon: Lightning,
    enabled: true,
    defaultSize: { w: 6, h: 3 }
  }
]

const DEFAULT_LAYOUT: Layout[] = [
  { i: 'stats-today', x: 0, y: 0, w: 4, h: 2 },
  { i: 'stats-customers', x: 4, y: 0, w: 4, h: 2 },
  { i: 'stats-week', x: 8, y: 0, w: 4, h: 2 },
  { i: 'today-schedule', x: 0, y: 2, w: 6, h: 4 },
  { i: 'upcoming', x: 6, y: 2, w: 6, h: 4 },
  { i: 'activity-feed', x: 0, y: 6, w: 6, h: 5 },
  { i: 'quick-actions', x: 6, y: 6, w: 6, h: 3 },
  { i: 'revenue-today', x: 6, y: 9, w: 6, h: 2 },
  { i: 'revenue-week', x: 0, y: 11, w: 4, h: 2 },
  { i: 'revenue-month', x: 4, y: 11, w: 4, h: 2 }
]

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [widgetConfigs, setWidgetConfigs] = useKV<WidgetConfig[]>('dashboard-widgets', DEFAULT_WIDGETS)
  const [layout, setLayout] = useKV<Layout[]>('dashboard-layout', DEFAULT_LAYOUT)
  const [showConfig, setShowConfig] = useState(false)

  const isCompact = appearance?.compactMode || false

  const handleToggleWidget = (widgetId: string) => {
    setWidgetConfigs((current) =>
      (current || DEFAULT_WIDGETS).map(w =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    )
  }

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT)
    setWidgetConfigs(DEFAULT_WIDGETS)
  }

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout)
  }

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'stats-today':
        return <StatsWidget type="today" onClick={() => onNavigate('appointments')} />
      case 'stats-customers':
        return <StatsWidget type="customers" onClick={() => onNavigate('customers')} />
      case 'stats-week':
        return <StatsWidget type="week" onClick={() => onNavigate('appointments')} />
      case 'today-schedule':
        return <TodayScheduleWidget isCompact={isCompact} />
      case 'upcoming':
        return <UpcomingAppointmentsWidget isCompact={isCompact} />
      case 'activity-feed':
        return <ActivityFeedWidget isCompact={isCompact} />
      case 'revenue-today':
        return <RevenueWidget period="today" />
      case 'revenue-week':
        return <RevenueWidget period="week" />
      case 'revenue-month':
        return <RevenueWidget period="month" />
      case 'quick-actions':
        return <QuickActionsWidget onNavigate={onNavigate} />
      default:
        return null
    }
  }

  const enabledWidgets = (widgetConfigs || DEFAULT_WIDGETS).filter(w => w.enabled)
  const currentLayout = (layout || DEFAULT_LAYOUT).filter(l =>
    enabledWidgets.some(w => w.id === l.i)
  )

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2"
          >
            <Sliders size={18} />
            <span className="hidden sm:inline">Customize</span>
          </Button>
          <Button onClick={() => onNavigate('appointments')} className="flex items-center space-x-2">
            <Plus size={18} />
            <span className="hidden sm:inline">New Appointment</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <GridLayout
          className="layout"
          layout={currentLayout}
          cols={12}
          rowHeight={60}
          width={1200}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-drag-handle"
          containerPadding={[0, 0]}
          margin={[isCompact ? 12 : 24, isCompact ? 12 : 24]}
          isResizable={true}
          isDraggable={true}
          compactType="vertical"
        >
          {enabledWidgets.map((widget) => (
            <div key={widget.id} className="widget-container">
              <div className="widget-drag-handle absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/20 rounded-full cursor-move hover:bg-muted-foreground/40 transition-colors z-10" />
              {renderWidget(widget.id)}
            </div>
          ))}
        </GridLayout>
      </div>

      <WidgetConfiguration
        open={showConfig}
        onOpenChange={setShowConfig}
        widgets={widgetConfigs || DEFAULT_WIDGETS}
        onToggleWidget={handleToggleWidget}
        onResetLayout={handleResetLayout}
      />
    </div>
  )
}