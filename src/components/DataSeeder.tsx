import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { seedData } from '@/lib/seedData'
import { Database, CircleNotch, Check, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function DataSeeder() {
  const [, setCustomers] = useKV<any[]>('customers', [])
  const [, setStaff] = useKV<any[]>('staff', [])
  const [, setServices] = useKV<any[]>('services', [])
  const [, setAppointments] = useKV<any[]>('appointments', [])
  const [, setTransactions] = useKV<any[]>('transactions', [])
  const [, setInventory] = useKV<any[]>('inventory', [])
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSeeded, setIsSeeded] = useState(false)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const data = await seedData()
      
      await setCustomers(() => data.customers)
      await setStaff(() => data.staff)
      await setServices(() => data.services)
      await setAppointments(() => data.appointments)
      await setTransactions(() => data.transactions)
      await setInventory(() => data.inventory)
      
      setIsSeeded(true)
      toast.success('Sample data loaded successfully!', {
        description: `Loaded ${data.appointments.length} appointments, ${data.transactions.length} transactions, ${data.customers.length} customers, and more.`
      })
    } catch (error) {
      toast.error('Failed to load sample data')
      console.error('Error seeding data:', error)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Card className="glass-card p-6 max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Database className="w-6 h-6 text-primary" weight="duotone" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sample Data for October & November 2024
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Load sample data to see the app populated with appointments, customers, transactions, and more for October and November 2024.
          </p>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding || isSeeded}
              className="min-w-[140px]"
            >
              {isSeeding ? (
                <>
                  <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isSeeded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Data Loaded
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Load Sample Data
                </>
              )}
            </Button>
            {isSeeded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Warning className="w-4 h-4" />
                <span>Reload to load again</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
