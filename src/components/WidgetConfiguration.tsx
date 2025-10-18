import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export interface WidgetConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  enabled: boolean
  defaultSize: { w: number; h: number }
}

interface WidgetConfigurationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgets: WidgetConfig[]
  onToggleWidget: (widgetId: string) => void
  onResetLayout: () => void
}

export function WidgetConfiguration({
  open,
  onOpenChange,
  widgets,
  onToggleWidget,
  onResetLayout
}: WidgetConfigurationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard. You can drag and resize them after saving.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {widgets.map((widget) => {
              const Icon = widget.icon
              return (
                <Card
                  key={widget.id}
                  className={`p-4 cursor-pointer transition-all ${
                    widget.enabled ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => onToggleWidget(widget.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={widget.enabled}
                      onCheckedChange={() => onToggleWidget(widget.id)}
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
            <Button variant="outline" onClick={onResetLayout}>
              Reset Layout
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
