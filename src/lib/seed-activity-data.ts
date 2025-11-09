import { Activity } from './activity-tracker'

export const sampleActivities: Activity[] = [
  {
    id: 'activity-1',
    timestamp: Date.now() - 1000 * 60 * 5,
    staffId: 'staff-1',
    staffName: 'Sarah Johnson',
    action: 'Completed Appointment',
    details: 'Full grooming service for Max (Golden Retriever)',
    type: 'appointment'
  },
  {
    id: 'activity-2',
    timestamp: Date.now() - 1000 * 60 * 12,
    staffId: 'staff-2',
    staffName: 'Mike Chen',
    action: 'Processed Sale',
    details: 'Sold Premium Shampoo and Nail Clippers - $45.99',
    type: 'sale'
  },
  {
    id: 'activity-3',
    timestamp: Date.now() - 1000 * 60 * 25,
    staffId: 'staff-1',
    staffName: 'Sarah Johnson',
    action: 'Added New Customer',
    details: 'Jessica Martinez with pet Bella (Poodle)',
    type: 'customer'
  },
  {
    id: 'activity-4',
    timestamp: Date.now() - 1000 * 60 * 45,
    staffId: 'staff-3',
    staffName: 'Emily Rodriguez',
    action: 'Updated Inventory',
    details: 'Restocked Dog Shampoo - Added 12 units',
    type: 'inventory'
  },
  {
    id: 'activity-5',
    timestamp: Date.now() - 1000 * 60 * 60,
    staffId: 'staff-2',
    staffName: 'Mike Chen',
    action: 'Scheduled Appointment',
    details: 'Bath & Brush for Charlie on Dec 28 at 2:00 PM',
    type: 'appointment'
  },
  {
    id: 'activity-6',
    timestamp: Date.now() - 1000 * 60 * 90,
    staffId: 'staff-1',
    staffName: 'Sarah Johnson',
    action: 'Completed Appointment',
    details: 'Nail trim service for Luna (Beagle)',
    type: 'appointment'
  },
  {
    id: 'activity-7',
    timestamp: Date.now() - 1000 * 60 * 120,
    staffId: 'staff-3',
    staffName: 'Emily Rodriguez',
    action: 'Updated Service',
    details: 'Modified pricing for Premium Spa Package',
    type: 'service'
  },
  {
    id: 'activity-8',
    timestamp: Date.now() - 1000 * 60 * 150,
    staffId: 'staff-2',
    staffName: 'Mike Chen',
    action: 'Processed Sale',
    details: 'Sold Dental Care Kit - $29.99',
    type: 'sale'
  },
  {
    id: 'activity-9',
    timestamp: Date.now() - 1000 * 60 * 180,
    staffId: 'staff-1',
    staffName: 'Sarah Johnson',
    action: 'Added New Customer',
    details: 'Robert Thompson with pet Duke (German Shepherd)',
    type: 'customer'
  },
  {
    id: 'activity-10',
    timestamp: Date.now() - 1000 * 60 * 210,
    staffId: 'staff-3',
    staffName: 'Emily Rodriguez',
    action: 'Updated Staff Schedule',
    details: 'Modified availability for next week',
    type: 'staff'
  }
]

export async function seedActivityData() {
  const stored = window.localStorage.getItem('recent-activities')
  const existingActivities = stored ? (JSON.parse(stored) as Activity[]) : null
  
  if (!existingActivities || existingActivities.length === 0) {
    window.localStorage.setItem('recent-activities', JSON.stringify(sampleActivities))
    console.log('Activity data seeded successfully')
  }
}
