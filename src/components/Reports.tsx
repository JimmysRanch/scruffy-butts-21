import { ChartBar, User } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroomerStats } from '@/components/GroomerStats'

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ChartBar className="w-8 h-8 text-primary" weight="duotone" />
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">Comprehensive analytics and performance insights</p>
      </div>

      <Tabs defaultValue="groomer-stats" className="space-y-6">
        <TabsList className="frosted">
          <TabsTrigger value="groomer-stats">
            <User className="w-4 h-4 mr-2" weight="duotone" />
            Groomer Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groomer-stats">
          <GroomerStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
