export interface Activity {
  id: string
  timestamp: number
  staffId: string
  staffName: string
  action: string
  details: string
  type: 'appointment' | 'customer' | 'inventory' | 'sale' | 'staff' | 'service'
}

export async function logActivity(
  staffId: string,
  staffName: string,
  action: string,
  details: string,
  type: Activity['type']
) {
  const activity: Activity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    staffId,
    staffName,
    action,
    details,
    type
  }

  const activities = await window.spark.kv.get<Activity[]>('recent-activities') || []
  activities.unshift(activity)
  
  const maxActivities = 100
  const trimmedActivities = activities.slice(0, maxActivities)
  
  await window.spark.kv.set('recent-activities', trimmedActivities)
}
