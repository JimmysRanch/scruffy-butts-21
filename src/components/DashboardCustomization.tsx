import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Calendar, Users, ChartBar, Clock, ArrowLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface WidgetConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  defaultSize: { w: number; h: number }
}

interface DashboardCustomizationProps {
  onBack: () => void
}

const WIDGET_ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  'total-appointments': Calendar,
  'week-appointments': Calendar,
  'booked-widget': ChartBar,
  'revenue-gauge': ChartBar,
  'groomer-workload': Users,
  'today-schedule': Clock
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'total-appointments',
    name: 'Total Appointments',
    description: 'Shows total appointment count for today',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'week-appointments',
    name: 'This Week',
    description: 'Shows appointments scheduled this week',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'booked-widget',
    name: 'Booked Today',
    description: 'Shows booking percentage for today',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'revenue-gauge',
    name: 'Revenue Gauge',
    description: 'Shows daily revenue progress',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'groomer-workload',
    name: 'Groomer Workload',
    description: 'Shows staff workload distribution',
    enabled: true,
    defaultSize: { w: 2, h: 1 }
  },
  {
    id: 'today-schedule',
    name: "Today's Schedule",
    description: 'Quick view of today\'s appointments',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  }
]

export function DashboardCustomization({ onBack }: DashboardCustomizationProps) {
  const [widgets, setWidgets] = useKV<WidgetConfig[]>('dashboard-widgets', DEFAULT_WIDGETS)

  const handleToggleWidget = (widgetId: string) => {
    setWidgets((current) =>
      (current || DEFAULT_WIDGETS).map(w =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    )
  }

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS)
    toast.success('Dashboard layout reset to default')
  }

  const handleSave = () => {
    toast.success('Dashboard customization saved')
    onBack()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white/90">Customize Dashboard</h1>
          <p className="text-sm text-white/60 mt-1">Choose which widgets to display on your dashboard</p>
        </div>
      </div>

      <div className="glass-card rounded-[1.25rem] p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(widgets || DEFAULT_WIDGETS).map((widget) => {
              const Icon = WIDGET_ICON_MAP[widget.id] || Calendar
              return (
                <Card
                  key={widget.id}
                  className={`p-4 cursor-pointer transition-all ${
                    widget.enabled ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => handleToggleWidget(widget.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={widget.enabled}
                      onCheckedChange={() => handleToggleWidget(widget.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={18} className="text-primary" />
                        <Label className="font-semibold cursor-pointer">
                          {widget.name}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleResetLayout}>
              Reset Layout
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
