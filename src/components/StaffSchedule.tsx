import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, Calendar, Clock, User, CaretLeft, CaretRight, 
  X, Check, Coffee, Airplane, FirstAid, PencilSimple, Trash,
  Download, Upload, CalendarBlank, ClockCounterClockwise
} from '@phosphor-icons/react'
import { 
  format, addDays, startOfWeek, endOfWeek, addWeeks, 
  isSameDay, parseISO, isToday, startOfDay, eachDayOfInterval,
  addMonths, startOfMonth, endOfMonth, isSameMonth, getDay
} from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  status: 'active' | 'inactive'
  rating: number
}

interface Shift {
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

interface RegularSchedule {
  id: string
  staffId: string
  daysOfWeek: number[]
  startTime: string
  endTime: string
  effectiveDate: string
  notes?: string
  createdAt: string
}

interface TimeOffRequest {
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

type ViewMode = 'week' | 'month'

const SHIFT_TYPE_COLORS = {
  regular: 'bg-primary/10 text-primary border-primary/30',
  break: 'bg-amber-50 text-amber-700 border-amber-300',
  'time-off': 'bg-gray-100 text-gray-600 border-gray-300'
}

const TIME_OFF_COLORS = {
  vacation: 'bg-blue-100 text-blue-800 border-blue-300',
  sick: 'bg-red-100 text-red-800 border-red-300',
  personal: 'bg-purple-100 text-purple-800 border-purple-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300'
}

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
]

export function StaffSchedule() {
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [shifts, setShifts] = useKV<Shift[]>('staff-shifts', [])
  const [regularSchedules, setRegularSchedules] = useKV<RegularSchedule[]>('regular-schedules', [])
  const [timeOffRequests, setTimeOffRequests] = useKV<TimeOffRequest[]>('time-off-requests', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false)
  const [isRegularScheduleDialogOpen, setIsRegularScheduleDialogOpen] = useState(false)
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [editingRegularSchedule, setEditingRegularSchedule] = useState<RegularSchedule | null>(null)
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOffRequest | null>(null)
  
  const [formStaffId, setFormStaffId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndTime, setFormEndTime] = useState('')
  const [formShiftType, setFormShiftType] = useState<Shift['type']>('regular')
  const [formNotes, setFormNotes] = useState('')
  
  const [formTimeOffStaffId, setFormTimeOffStaffId] = useState('')
  const [formTimeOffStartDate, setFormTimeOffStartDate] = useState('')
  const [formTimeOffEndDate, setFormTimeOffEndDate] = useState('')
  const [formTimeOffType, setFormTimeOffType] = useState<TimeOffRequest['type']>('vacation')
  const [formTimeOffReason, setFormTimeOffReason] = useState('')

  const [formRegularStaffId, setFormRegularStaffId] = useState('')
  const [formRegularDays, setFormRegularDays] = useState<number[]>([])
  const [formRegularStartTime, setFormRegularStartTime] = useState('')
  const [formRegularEndTime, setFormRegularEndTime] = useState('')
  const [formRegularEffectiveDate, setFormRegularEffectiveDate] = useState('')
  const [formRegularNotes, setFormRegularNotes] = useState('')

  const isCompact = appearance?.compactMode || false

  const activeStaffMembers = useMemo(() => {
    return staffMembers?.filter(s => s.status === 'active') || []
  }, [staffMembers])

  const filteredStaffMembers = useMemo(() => {
    if (selectedStaff === 'all') return activeStaffMembers
    return activeStaffMembers.filter(s => s.id === selectedStaff)
  }, [activeStaffMembers, selectedStaff])

  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return eachDayOfInterval({ start, end })
    }
  }, [currentDate, viewMode])

  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift[]>()
    
    shifts?.forEach(shift => {
      const key = `${shift.staffId}-${shift.date}`
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(shift)
    })
    
    return map
  }, [shifts])

  const timeOffMap = useMemo(() => {
    const map = new Map<string, TimeOffRequest[]>()
    
    timeOffRequests?.forEach(request => {
      if (request.status !== 'approved') return
      
      const startDate = parseISO(request.startDate)
      const endDate = parseISO(request.endDate)
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      
      days.forEach(day => {
        const key = `${request.staffId}-${format(day, 'yyyy-MM-dd')}`
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)!.push(request)
      })
    })
    
    return map
  }, [timeOffRequests])

  const pendingTimeOffRequests = useMemo(() => {
    return timeOffRequests?.filter(r => r.status === 'pending') || []
  }, [timeOffRequests])

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, -1))
    } else {
      setCurrentDate(addMonths(currentDate, -1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const openNewShiftDialog = (staffId?: string, date?: string) => {
    setEditingShift(null)
    setFormStaffId(staffId || '')
    setFormDate(date || format(new Date(), 'yyyy-MM-dd'))
    setFormStartTime('9:00 AM')
    setFormEndTime('5:00 PM')
    setFormShiftType('regular')
    setFormNotes('')
    setIsShiftDialogOpen(true)
  }

  const openEditShiftDialog = (shift: Shift) => {
    setEditingShift(shift)
    setFormStaffId(shift.staffId)
    setFormDate(shift.date)
    setFormStartTime(shift.startTime)
    setFormEndTime(shift.endTime)
    setFormShiftType(shift.type)
    setFormNotes(shift.notes || '')
    setIsShiftDialogOpen(true)
  }

  const handleSaveShift = () => {
    if (!formStaffId || !formDate || !formStartTime || !formEndTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const shiftData: Shift = {
      id: editingShift?.id || `shift-${Date.now()}`,
      staffId: formStaffId,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      type: formShiftType,
      status: editingShift?.status || 'scheduled',
      notes: formNotes,
      createdAt: editingShift?.createdAt || new Date().toISOString()
    }

    setShifts(current => {
      const filtered = (current || []).filter(s => s.id !== shiftData.id)
      return [...filtered, shiftData].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
    })

    toast.success(editingShift ? 'Shift updated' : 'Shift created')
    setIsShiftDialogOpen(false)
  }

  const handleDeleteShift = (shiftId: string) => {
    setShifts(current => (current || []).filter(s => s.id !== shiftId))
    toast.success('Shift deleted')
  }

  const openNewTimeOffDialog = (staffId?: string) => {
    setEditingTimeOff(null)
    setFormTimeOffStaffId(staffId || '')
    setFormTimeOffStartDate(format(new Date(), 'yyyy-MM-dd'))
    setFormTimeOffEndDate(format(new Date(), 'yyyy-MM-dd'))
    setFormTimeOffType('vacation')
    setFormTimeOffReason('')
    setIsTimeOffDialogOpen(true)
  }

  const handleSaveTimeOff = () => {
    if (!formTimeOffStaffId || !formTimeOffStartDate || !formTimeOffEndDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const timeOffData: TimeOffRequest = {
      id: editingTimeOff?.id || `timeoff-${Date.now()}`,
      staffId: formTimeOffStaffId,
      startDate: formTimeOffStartDate,
      endDate: formTimeOffEndDate,
      type: formTimeOffType,
      reason: formTimeOffReason,
      status: 'pending',
      createdAt: editingTimeOff?.createdAt || new Date().toISOString()
    }

    setTimeOffRequests(current => {
      const filtered = (current || []).filter(t => t.id !== timeOffData.id)
      return [...filtered, timeOffData].sort((a, b) => 
        a.startDate.localeCompare(b.startDate)
      )
    })

    toast.success('Time off request submitted')
    setIsTimeOffDialogOpen(false)
  }

  const handleApproveTimeOff = (requestId: string) => {
    setTimeOffRequests(current =>
      (current || []).map(r => 
        r.id === requestId 
          ? { ...r, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : r
      )
    )
    toast.success('Time off request approved')
  }

  const handleDenyTimeOff = (requestId: string) => {
    setTimeOffRequests(current =>
      (current || []).map(r => 
        r.id === requestId 
          ? { ...r, status: 'denied' as const }
          : r
      )
    )
    toast.success('Time off request denied')
  }

  const getStaffName = (staffId: string) => {
    const staff = staffMembers?.find(s => s.id === staffId)
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown'
  }

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = parseTime(startTime)
    const end = parseTime(endTime)
    const diff = end - start
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    
    return hours * 60 + minutes
  }

  const copyWeekSchedule = () => {
    if (viewMode !== 'week') {
      toast.error('Can only copy week schedules')
      return
    }

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

    const weekShifts = shifts?.filter(s => 
      s.date >= weekStartStr && s.date <= weekEndStr
    ) || []

    if (weekShifts.length === 0) {
      toast.error('No shifts to copy')
      return
    }

    const nextWeekStart = addWeeks(weekStart, 1)
    const copiedShifts: Shift[] = weekShifts.map(shift => {
      const shiftDate = parseISO(shift.date)
      const dayOffset = Math.floor((shiftDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
      const newDate = format(addDays(nextWeekStart, dayOffset), 'yyyy-MM-dd')

      return {
        ...shift,
        id: `shift-${Date.now()}-${Math.random()}`,
        date: newDate,
        status: 'scheduled' as const,
        createdAt: new Date().toISOString()
      }
    })

    setShifts(current => [...(current || []), ...copiedShifts])
    setCurrentDate(nextWeekStart)
    toast.success(`Copied ${copiedShifts.length} shifts to next week`)
  }

  const openRegularScheduleDialog = (staffId?: string) => {
    setEditingRegularSchedule(null)
    setFormRegularStaffId(staffId || '')
    setFormRegularDays([])
    setFormRegularStartTime('9:00 AM')
    setFormRegularEndTime('5:00 PM')
    setFormRegularEffectiveDate(format(new Date(), 'yyyy-MM-dd'))
    setFormRegularNotes('')
    setIsRegularScheduleDialogOpen(true)
  }

  const openEditRegularScheduleDialog = (schedule: RegularSchedule) => {
    setEditingRegularSchedule(schedule)
    setFormRegularStaffId(schedule.staffId)
    setFormRegularDays(schedule.daysOfWeek)
    setFormRegularStartTime(schedule.startTime)
    setFormRegularEndTime(schedule.endTime)
    setFormRegularEffectiveDate(schedule.effectiveDate)
    setFormRegularNotes(schedule.notes || '')
    setIsRegularScheduleDialogOpen(true)
  }

  const handleSaveRegularSchedule = () => {
    if (!formRegularStaffId || formRegularDays.length === 0 || !formRegularStartTime || !formRegularEndTime || !formRegularEffectiveDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const scheduleData: RegularSchedule = {
      id: editingRegularSchedule?.id || `reg-schedule-${Date.now()}`,
      staffId: formRegularStaffId,
      daysOfWeek: formRegularDays.sort((a, b) => a - b),
      startTime: formRegularStartTime,
      endTime: formRegularEndTime,
      effectiveDate: formRegularEffectiveDate,
      notes: formRegularNotes,
      createdAt: editingRegularSchedule?.createdAt || new Date().toISOString()
    }

    setRegularSchedules(current => {
      const filtered = (current || []).filter(s => s.id !== scheduleData.id)
      return [...filtered, scheduleData]
    })

    toast.success(editingRegularSchedule ? 'Regular schedule updated' : 'Regular schedule created')
    setIsRegularScheduleDialogOpen(false)
  }

  const handleDeleteRegularSchedule = (scheduleId: string) => {
    setRegularSchedules(current => (current || []).filter(s => s.id !== scheduleId))
    toast.success('Regular schedule deleted')
  }

  const toggleRegularDay = (day: number) => {
    setFormRegularDays(current => 
      current.includes(day) 
        ? current.filter(d => d !== day)
        : [...current, day]
    )
  }

  const getTotalHours = (staffId: string, date: string) => {
    const key = `${staffId}-${date}`
    const staffShifts = shiftsMap.get(key) || []
    const regularShifts = staffShifts.filter(s => s.type === 'regular')
    
    let totalMinutes = 0
    regularShifts.forEach(shift => {
      const start = parseTime(shift.startTime)
      const end = parseTime(shift.endTime)
      totalMinutes += end - start
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${hours}:00`
  }

  return (
    <div className="space-y-3">
      <div className="frosted rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Staff Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage staff shifts and time off
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size={isCompact ? "sm" : "default"}
              onClick={() => openRegularScheduleDialog()}
              className="glass-button"
            >
              <CalendarBlank size={16} className="mr-2" />
              Regular Schedule
            </Button>
            <Button
              variant="outline"
              size={isCompact ? "sm" : "default"}
              onClick={() => openNewTimeOffDialog()}
              className="glass-button"
            >
              <Airplane size={16} className="mr-2" />
              Time Off
            </Button>
            <Button
              size={isCompact ? "sm" : "default"}
              onClick={() => openNewShiftDialog()}
              className="glass-button"
            >
              <Plus size={16} className="mr-2" />
              Add Single Day
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigatePrevious}
              className="glass-button"
            >
              <CaretLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToday}
              className="glass-button"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateNext}
              className="glass-button"
            >
              <CaretRight size={16} />
            </Button>
            <div className="text-sm font-medium ml-2">
              {viewMode === 'week' 
                ? `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="glass-dark">
                <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-[180px] glass-dark">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {activeStaffMembers.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {pendingTimeOffRequests.length > 0 && (
        <Card className="frosted border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending Time Off Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTimeOffRequests.map(request => {
              const staff = staffMembers?.find(s => s.id === request.staffId)
              return (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg glass-dark">
                  <div className="flex-1">
                    <div className="font-medium">
                      {staff?.firstName} {staff?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(request.startDate), 'MMM d')} - {format(parseISO(request.endDate), 'MMM d, yyyy')}
                      <Badge className={cn('ml-2', TIME_OFF_COLORS[request.type])}>
                        {request.type}
                      </Badge>
                    </div>
                    {request.reason && (
                      <div className="text-xs text-muted-foreground mt-1">{request.reason}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveTimeOff(request.id)}
                      className="glass-button"
                    >
                      <Check size={14} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDenyTimeOff(request.id)}
                      className="glass-button text-destructive"
                    >
                      <X size={14} className="mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="frosted rounded-xl overflow-hidden">
        {viewMode === 'week' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/5 border-b border-border">
                  <th className="sticky left-0 bg-primary/5 z-10 px-3 py-2 text-left text-xs font-medium text-muted-foreground w-[150px]">
                    Staff
                  </th>
                  {dateRange.map(date => (
                    <th key={date.toISOString()} className="px-3 py-2 text-center text-xs font-medium min-w-[140px]">
                      <div className={cn(
                        "font-semibold",
                        isToday(date) && "text-primary"
                      )}>
                        {format(date, 'EEE')}
                      </div>
                      <div className={cn(
                        "text-muted-foreground",
                        isToday(date) && "text-primary font-medium"
                      )}>
                        {format(date, 'MMM d')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaffMembers.map(staff => (
                  <tr key={staff.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                    <td className="sticky left-0 bg-card z-10 px-3 py-3 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </div>
                        <div>
                          <div>{staff.firstName} {staff.lastName}</div>
                          <div className="text-xs text-muted-foreground">{staff.position}</div>
                        </div>
                      </div>
                    </td>
                    {dateRange.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd')
                      const key = `${staff.id}-${dateStr}`
                      const dayShifts = shiftsMap.get(key) || []
                      const timeOff = timeOffMap.get(key)?.[0]
                      const totalHours = getTotalHours(staff.id, dateStr)

                      return (
                        <td 
                          key={dateStr} 
                          className={cn(
                            "px-2 py-2 align-top",
                            isToday(date) && "bg-primary/5"
                          )}
                        >
                          {timeOff ? (
                            <div className={cn(
                              "px-2 py-1.5 rounded text-xs border text-center",
                              TIME_OFF_COLORS[timeOff.type]
                            )}>
                              <Airplane size={12} className="mx-auto mb-0.5" />
                              <div className="font-medium capitalize">{timeOff.type}</div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {dayShifts.length === 0 ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-12 border border-dashed border-border/50 hover:border-primary/50 text-xs text-muted-foreground"
                                  onClick={() => openNewShiftDialog(staff.id, dateStr)}
                                >
                                  <Plus size={12} />
                                </Button>
                              ) : (
                                <>
                                  {dayShifts.map(shift => (
                                    <div
                                      key={shift.id}
                                      className={cn(
                                        "group px-2 py-1.5 rounded text-xs border cursor-pointer hover:shadow-sm transition-all",
                                        SHIFT_TYPE_COLORS[shift.type]
                                      )}
                                      onClick={() => openEditShiftDialog(shift)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <Clock size={10} className="flex-shrink-0" />
                                        <span className="text-[10px] font-medium ml-1">
                                          {shift.startTime.replace(' ', '')} - {shift.endTime.replace(' ', '')}
                                        </span>
                                      </div>
                                      {shift.type === 'break' && (
                                        <div className="flex items-center justify-center mt-0.5">
                                          <Coffee size={10} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {dayShifts.some(s => s.type === 'regular') && (
                                    <div className="text-[10px] text-center text-muted-foreground font-medium mt-1">
                                      {totalHours}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-primary/5 p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted/30 min-h-[100px]" />
              ))}
              
              {dateRange.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayShiftsCount = filteredStaffMembers.reduce((count, staff) => {
                  const key = `${staff.id}-${dateStr}`
                  const dayShifts = shiftsMap.get(key) || []
                  return count + dayShifts.filter(s => s.type === 'regular').length
                }, 0)

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "bg-card p-2 min-h-[100px] border border-border/50",
                      !isSameMonth(date, currentDate) && "opacity-50",
                      isToday(date) && "ring-2 ring-primary ring-inset"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday(date) && "text-primary"
                    )}>
                      {format(date, 'd')}
                    </div>
                    
                    {dayShiftsCount > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {dayShiftsCount} shift{dayShiftsCount !== 1 ? 's' : ''}
                        </div>
                        {filteredStaffMembers.slice(0, 3).map(staff => {
                          const key = `${staff.id}-${dateStr}`
                          const dayShifts = shiftsMap.get(key)?.filter(s => s.type === 'regular') || []
                          
                          if (dayShifts.length === 0) return null
                          
                          return (
                            <div key={staff.id} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded truncate">
                              {staff.firstName}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="frosted max-w-md">
          <DialogHeader>
            <DialogTitle>{editingShift ? 'Edit Single Day' : 'Add Single Day'}</DialogTitle>
            <DialogDescription>
              {editingShift ? 'Update shift details for this specific day' : 'Add a one-time shift for a specific day'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift-staff">Staff Member</Label>
              <Select value={formStaffId} onValueChange={setFormStaffId}>
                <SelectTrigger id="shift-staff" className="glass-dark">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-date">Date</Label>
              <Input
                id="shift-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="glass-dark"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="shift-start">Start Time</Label>
                <Select value={formStartTime} onValueChange={setFormStartTime}>
                  <SelectTrigger id="shift-start" className="glass-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift-end">End Time</Label>
                <Select value={formEndTime} onValueChange={setFormEndTime}>
                  <SelectTrigger id="shift-end" className="glass-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-type">Shift Type</Label>
              <Select value={formShiftType} onValueChange={(v) => setFormShiftType(v as Shift['type'])}>
                <SelectTrigger id="shift-type" className="glass-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Shift</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="time-off">Time Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-notes">Notes (Optional)</Label>
              <Textarea
                id="shift-notes"
                placeholder="Add any notes..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="glass-dark"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingShift && (
              <Button
                variant="outline"
                onClick={() => {
                  handleDeleteShift(editingShift.id)
                  setIsShiftDialogOpen(false)
                }}
                className="glass-button mr-auto text-destructive"
              >
                <Trash size={14} className="mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsShiftDialogOpen(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleSaveShift} className="glass-button">
              {editingShift ? 'Update' : 'Create'} Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegularScheduleDialogOpen} onOpenChange={setIsRegularScheduleDialogOpen}>
        <DialogContent className="frosted max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRegularSchedule ? 'Edit Regular Schedule' : 'Set Regular Schedule'}</DialogTitle>
            <DialogDescription>
              Define recurring weekly shifts for a staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regular-staff">Staff Member</Label>
              <Select value={formRegularStaffId} onValueChange={setFormRegularStaffId}>
                <SelectTrigger id="regular-staff" className="glass-dark">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formRegularDays.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRegularDay(index)}
                    className={cn(
                      "p-2 h-auto",
                      formRegularDays.includes(index) ? "glass-button" : "glass-button"
                    )}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="regular-start">Start Time</Label>
                <Select value={formRegularStartTime} onValueChange={setFormRegularStartTime}>
                  <SelectTrigger id="regular-start" className="glass-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regular-end">End Time</Label>
                <Select value={formRegularEndTime} onValueChange={setFormRegularEndTime}>
                  <SelectTrigger id="regular-end" className="glass-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regular-effective">Effective From</Label>
              <Input
                id="regular-effective"
                type="date"
                value={formRegularEffectiveDate}
                onChange={(e) => setFormRegularEffectiveDate(e.target.value)}
                className="glass-dark"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regular-notes">Notes (Optional)</Label>
              <Textarea
                id="regular-notes"
                placeholder="Add any notes..."
                value={formRegularNotes}
                onChange={(e) => setFormRegularNotes(e.target.value)}
                className="glass-dark"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingRegularSchedule && (
              <Button
                variant="outline"
                onClick={() => {
                  handleDeleteRegularSchedule(editingRegularSchedule.id)
                  setIsRegularScheduleDialogOpen(false)
                }}
                className="glass-button mr-auto text-destructive"
              >
                <Trash size={14} className="mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsRegularScheduleDialogOpen(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleSaveRegularSchedule} className="glass-button">
              {editingRegularSchedule ? 'Update' : 'Create'} Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
        <DialogContent className="frosted max-w-md">
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>
              Submit a time off request for a staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="timeoff-staff">Staff Member</Label>
              <Select value={formTimeOffStaffId} onValueChange={setFormTimeOffStaffId}>
                <SelectTrigger id="timeoff-staff" className="glass-dark">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="timeoff-start">Start Date</Label>
                <Input
                  id="timeoff-start"
                  type="date"
                  value={formTimeOffStartDate}
                  onChange={(e) => setFormTimeOffStartDate(e.target.value)}
                  className="glass-dark"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeoff-end">End Date</Label>
                <Input
                  id="timeoff-end"
                  type="date"
                  value={formTimeOffEndDate}
                  onChange={(e) => setFormTimeOffEndDate(e.target.value)}
                  className="glass-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeoff-type">Type</Label>
              <Select value={formTimeOffType} onValueChange={(v) => setFormTimeOffType(v as TimeOffRequest['type'])}>
                <SelectTrigger id="timeoff-type" className="glass-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeoff-reason">Reason (Optional)</Label>
              <Textarea
                id="timeoff-reason"
                placeholder="Provide a reason..."
                value={formTimeOffReason}
                onChange={(e) => setFormTimeOffReason(e.target.value)}
                className="glass-dark"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeOffDialogOpen(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleSaveTimeOff} className="glass-button">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
