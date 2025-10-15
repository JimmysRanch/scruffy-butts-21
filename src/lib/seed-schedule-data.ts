import { format, addDays, startOfWeek } from 'date-fns'

export interface Shift {
  id: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  type: 'regular' | 'break' | 'time-off'
  reason?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface TimeOffRequest {
  id: string
  staffId: string
  startDate: string
  endDate: string
  type: 'vacation' | 'sick' | 'personal' | 'other'
  reason?: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export const seedShifts = (staffIds: string[]): Shift[] => {
  const shifts: Shift[] = []
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 0 })
  
  staffIds.forEach((staffId, index) => {
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd')
      
      if (i === 0 || i === 6) {
        continue
      }
      
      if (index % 3 === 0 && i === 3) {
        continue
      }
      
      shifts.push({
        id: `shift-${staffId}-${i}`,
        staffId,
        date,
        startTime: '9:00 AM',
        endTime: '5:00 PM',
        type: 'regular',
        status: 'scheduled',
        createdAt: new Date().toISOString()
      })
      
      shifts.push({
        id: `break-${staffId}-${i}`,
        staffId,
        date,
        startTime: '12:00 PM',
        endTime: '1:00 PM',
        type: 'break',
        status: 'scheduled',
        createdAt: new Date().toISOString()
      })
    }
  })
  
  return shifts
}

export const seedTimeOffRequests = (staffIds: string[]): TimeOffRequest[] => {
  const requests: TimeOffRequest[] = []
  const now = new Date()
  
  if (staffIds.length > 0) {
    requests.push({
      id: 'timeoff-1',
      staffId: staffIds[0],
      startDate: format(addDays(now, 14), 'yyyy-MM-dd'),
      endDate: format(addDays(now, 18), 'yyyy-MM-dd'),
      type: 'vacation',
      reason: 'Family vacation',
      status: 'pending',
      createdAt: new Date().toISOString()
    })
  }
  
  if (staffIds.length > 1) {
    requests.push({
      id: 'timeoff-2',
      staffId: staffIds[1],
      startDate: format(addDays(now, 7), 'yyyy-MM-dd'),
      endDate: format(addDays(now, 7), 'yyyy-MM-dd'),
      type: 'sick',
      reason: 'Doctor appointment',
      status: 'approved',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })
  }
  
  return requests
}
