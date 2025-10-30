import { useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { addDays, format, startOfWeek } from 'date-fns'

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  createdAt: string
  notes?: string
  pets: Pet[]
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  createdAt: string
  pricingMethod?: 'service' | 'weight' | 'breed' | 'hybrid'
  basePrice?: number
  weightPricing?: Record<'small' | 'medium' | 'large' | 'giant', number>
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
  city: string
  state: string
  zip: string
  specialties: string[]
  notes: string
  status: 'active' | 'inactive'
  rating: number
  avatar?: string
  color?: string
  canBeBooked: boolean
  bookableServices: string[]
  commissionEnabled: boolean
  commissionPercent: number
  hourlyPayEnabled: boolean
  hourlyRate: number
  salaryEnabled: boolean
  salaryAmount: number
  weeklyGuaranteeEnabled: boolean
  weeklyGuarantee: number
  guaranteePayoutMethod: 'both' | 'higher'
  teamOverridesEnabled: boolean
  teamOverrides: Array<{ staffId: string; overridePercent: number }>
}

interface AppointmentTemplate {
  dayOffset: number
  time: string
  serviceIds: string[]
  customerId: string
  petId: string
  staffId: string
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  groomerRequested?: boolean
  reminderSent?: boolean
  confirmationSent?: boolean
  pickupNotificationSent?: boolean
  paymentMethod?: 'cash' | 'card' | 'cashapp' | 'chime'
  rating?: number
  priceOverride?: number
}

interface Appointment {
  id: string
  petId: string
  petName: string
  customerId: string
  customerFirstName: string
  customerLastName: string
  serviceId: string
  serviceIds: string[]
  service: string
  staffId: string
  groomerRequested?: boolean
  date: string
  time: string
  endTime: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminderSent?: boolean
  confirmationSent?: boolean
  pickupNotificationSent?: boolean
  pickupNotificationAcknowledged?: boolean
  checkInTime?: string
  checkOutTime?: string
  paymentCompleted?: boolean
  paymentMethod?: 'cash' | 'card' | 'cashapp' | 'chime'
  amountPaid?: number
  pickedUpTime?: string
  createdAt: string
  rating?: number
}

const toMinutes = (time: string) => {
  const [timePart, period] = time.split(' ')
  const [rawHours, rawMinutes] = timePart.split(':').map(Number)
  let hours = rawHours % 12
  if (period === 'PM') {
    hours += 12
  }
  return hours * 60 + (rawMinutes || 0)
}

const toTimeLabel = (totalMinutes: number) => {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
  const hours24 = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const toIsoDateTime = (date: string, minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${date}T${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
}

function buildDefaultServices(nowIso: string): Service[] {
  return [
    {
      id: 'service-full-groom',
      name: 'Full Groom',
      description: 'Complete grooming package with haircut, bath, blow out, and finishing touches.',
      duration: 120,
      price: 85,
      category: 'Full Groom',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 85
    },
    {
      id: 'service-bath-brush',
      name: 'Bath & Brush',
      description: 'Warm bath, gentle shampoo, blow dry, and brush out for a fresh coat.',
      duration: 60,
      price: 45,
      category: 'Bath',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 45
    },
    {
      id: 'service-deshedding',
      name: 'Deshedding Treatment',
      description: 'Targeted deshedding solution to reduce loose undercoat and shedding.',
      duration: 45,
      price: 35,
      category: 'Treatment',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 35
    },
    {
      id: 'service-nail-trim',
      name: 'Nail Trim',
      description: 'Professional nail trim and filing to keep paws tidy and safe.',
      duration: 15,
      price: 15,
      category: 'Add-On',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 15
    },
    {
      id: 'service-teeth-brushing',
      name: 'Teeth Brushing',
      description: 'Gentle teeth brushing with enzymatic toothpaste for fresh breath.',
      duration: 15,
      price: 12,
      category: 'Add-On',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 12
    },
    {
      id: 'service-spa-day',
      name: 'Spa Day Upgrade',
      description: 'Blueberry facial, paw balm, and conditioning massage for the ultimate spa day.',
      duration: 30,
      price: 40,
      category: 'Premium',
      createdAt: nowIso,
      pricingMethod: 'service',
      basePrice: 40
    }
  ]
}

function buildDefaultStaff(nowIso: string): StaffMember[] {
  return [
    {
      id: 'staff-sarah-johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@scruffybutts.com',
      phone: '(555) 210-0198',
      position: 'Lead Groomer',
      hireDate: '2020-05-18',
      address: '123 Pawprint Lane',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      specialties: ['Doodles', 'Show Cuts', 'Hand Stripping'],
      notes: 'Loves working with anxious pups and specializes in custom breed trims.',
      status: 'active',
      rating: 4.9,
      avatar: undefined,
      color: '#6366f1',
      canBeBooked: true,
      bookableServices: ['service-full-groom', 'service-bath-brush', 'service-deshedding', 'service-spa-day', 'service-teeth-brushing'],
      commissionEnabled: true,
      commissionPercent: 35,
      hourlyPayEnabled: true,
      hourlyRate: 24,
      salaryEnabled: false,
      salaryAmount: 0,
      weeklyGuaranteeEnabled: true,
      weeklyGuarantee: 900,
      guaranteePayoutMethod: 'higher',
      teamOverridesEnabled: true,
      teamOverrides: [{ staffId: 'staff-emily-rodriguez', overridePercent: 5 }]
    },
    {
      id: 'staff-mike-chen',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike@scruffybutts.com',
      phone: '(555) 210-1182',
      position: 'Senior Groomer',
      hireDate: '2021-08-09',
      address: '412 Wags Trail',
      city: 'Austin',
      state: 'TX',
      zip: '78702',
      specialties: ['Double Coats', 'Deshedding', 'Puppy Grooms'],
      notes: 'Requests extra time for first-time puppies to build trust.',
      status: 'active',
      rating: 4.7,
      avatar: undefined,
      color: '#8b5cf6',
      canBeBooked: true,
      bookableServices: ['service-full-groom', 'service-bath-brush', 'service-deshedding', 'service-nail-trim'],
      commissionEnabled: true,
      commissionPercent: 30,
      hourlyPayEnabled: true,
      hourlyRate: 22,
      salaryEnabled: false,
      salaryAmount: 0,
      weeklyGuaranteeEnabled: false,
      weeklyGuarantee: 0,
      guaranteePayoutMethod: 'higher',
      teamOverridesEnabled: false,
      teamOverrides: []
    },
    {
      id: 'staff-emily-rodriguez',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily@scruffybutts.com',
      phone: '(555) 210-2251',
      position: 'Pet Stylist',
      hireDate: '2022-02-14',
      address: '89 Pup Plaza',
      city: 'Austin',
      state: 'TX',
      zip: '78703',
      specialties: ['Bath & Brush', 'Teeth Brushing', 'Senior Pets'],
      notes: 'Great with seniors and dogs that need a calm, steady presence.',
      status: 'active',
      rating: 4.8,
      avatar: undefined,
      color: '#ec4899',
      canBeBooked: true,
      bookableServices: ['service-bath-brush', 'service-teeth-brushing', 'service-nail-trim', 'service-spa-day'],
      commissionEnabled: true,
      commissionPercent: 25,
      hourlyPayEnabled: true,
      hourlyRate: 19,
      salaryEnabled: false,
      salaryAmount: 0,
      weeklyGuaranteeEnabled: false,
      weeklyGuarantee: 0,
      guaranteePayoutMethod: 'higher',
      teamOverridesEnabled: false,
      teamOverrides: []
    },
    {
      id: 'staff-alex-thompson',
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex@scruffybutts.com',
      phone: '(555) 210-4470',
      position: 'Front Desk & Bather',
      hireDate: '2019-11-04',
      address: '250 Groomer Row',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      specialties: ['Bathing', 'Client Experience', 'Product Knowledge'],
      notes: 'Splits time between greeting clients and assisting with baths on busy days.',
      status: 'active',
      rating: 4.6,
      avatar: undefined,
      color: '#10b981',
      canBeBooked: false,
      bookableServices: [],
      commissionEnabled: false,
      commissionPercent: 0,
      hourlyPayEnabled: true,
      hourlyRate: 18,
      salaryEnabled: false,
      salaryAmount: 0,
      weeklyGuaranteeEnabled: false,
      weeklyGuarantee: 0,
      guaranteePayoutMethod: 'higher',
      teamOverridesEnabled: false,
      teamOverrides: []
    }
  ]
}

function buildDefaultCustomers(nowIso: string): Customer[] {
  return [
    {
      id: 'customer-lena-harris',
      firstName: 'Lena',
      lastName: 'Harris',
      email: 'lena.harris@example.com',
      phone: '(555) 301-1188',
      address: '1023 Maple Avenue',
      city: 'Austin',
      state: 'TX',
      zip: '78705',
      createdAt: '2023-06-12T14:20:00.000Z',
      notes: 'Prefers early morning drop-offs and text updates.',
      pets: [
        {
          id: 'pet-milo',
          name: 'Milo',
          breed: 'Goldendoodle',
          size: 'large',
          notes: 'Needs deshedding every visit.'
        },
        {
          id: 'pet-poppy',
          name: 'Poppy',
          breed: 'Cavalier King Charles Spaniel',
          size: 'small',
          notes: 'Sensitive skin—use hypoallergenic shampoo.'
        }
      ]
    },
    {
      id: 'customer-jamal-ortiz',
      firstName: 'Jamal',
      lastName: 'Ortiz',
      email: 'jamal.ortiz@example.com',
      phone: '(555) 301-4412',
      address: '8801 Sunset Cove',
      city: 'Austin',
      state: 'TX',
      zip: '78744',
      createdAt: '2022-11-03T17:10:00.000Z',
      notes: 'Rocky can be nervous with dryers, prefers towel dry when possible.',
      pets: [
        {
          id: 'pet-rocky',
          name: 'Rocky',
          breed: 'English Bulldog',
          size: 'medium',
          notes: 'Short sessions with breaks are best.'
        }
      ]
    },
    {
      id: 'customer-priya-patel',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@example.com',
      phone: '(555) 301-7720',
      address: '6902 Whispering Oaks Dr',
      city: 'Austin',
      state: 'TX',
      zip: '78759',
      createdAt: '2024-01-22T19:45:00.000Z',
      notes: 'Nala is a working dog—needs tight schedule adherence.',
      pets: [
        {
          id: 'pet-nala',
          name: 'Nala',
          breed: 'German Shepherd',
          size: 'large',
          notes: 'Schedule late afternoon pick-up for training classes.'
        },
        {
          id: 'pet-simba',
          name: 'Simba',
          breed: 'Maine Coon',
          size: 'medium',
          notes: 'Indoor cat, loves warm towels.'
        }
      ]
    },
    {
      id: 'customer-evan-brooks',
      firstName: 'Evan',
      lastName: 'Brooks',
      email: 'evan.brooks@example.com',
      phone: '(555) 301-9934',
      address: '5007 Lakeview Terrace',
      city: 'Austin',
      state: 'TX',
      zip: '78731',
      createdAt: '2021-09-18T15:30:00.000Z',
      notes: 'Bella is a therapy dog—keep coat medium length.',
      pets: [
        {
          id: 'pet-bella',
          name: 'Bella',
          breed: 'Labradoodle',
          size: 'large',
          notes: 'Needs spa upgrade before hospital visits.'
        }
      ]
    },
    {
      id: 'customer-grace-kim',
      firstName: 'Grace',
      lastName: 'Kim',
      email: 'grace.kim@example.com',
      phone: '(555) 301-6644',
      address: '1410 Cedar Crest',
      city: 'Austin',
      state: 'TX',
      zip: '78746',
      createdAt: '2023-02-08T13:05:00.000Z',
      notes: 'Prefers Saturday appointments and card payments.',
      pets: [
        {
          id: 'pet-luna',
          name: 'Luna',
          breed: 'Pomeranian',
          size: 'small',
          notes: 'Add teeth brushing every other visit.'
        },
        {
          id: 'pet-duke',
          name: 'Duke',
          breed: 'Great Dane',
          size: 'large',
          notes: 'Requires two-person lift for tub entry.'
        }
      ]
    }
  ]
}

function buildDefaultAppointments(
  weekStart: Date,
  services: Service[],
  customers: Customer[],
  nowIso: string
): Appointment[] {
  const serviceMap = new Map(services.map(service => [service.id, service]))
  const customerMap = new Map(customers.map(customer => [customer.id, customer]))

  const templates: AppointmentTemplate[] = [
    {
      dayOffset: 0,
      time: '8:30 AM',
      serviceIds: ['service-bath-brush', 'service-teeth-brushing'],
      customerId: 'customer-lena-harris',
      petId: 'pet-poppy',
      staffId: 'staff-emily-rodriguez',
      status: 'completed',
      notes: 'Used hypoallergenic shampoo per request.',
      paymentMethod: 'card',
      rating: 5
    },
    {
      dayOffset: 0,
      time: '10:30 AM',
      serviceIds: ['service-full-groom'],
      customerId: 'customer-jamal-ortiz',
      petId: 'pet-rocky',
      staffId: 'staff-mike-chen',
      status: 'completed',
      notes: 'Short breaks between steps helped keep Rocky calm.',
      paymentMethod: 'cash',
      rating: 4
    },
    {
      dayOffset: 1,
      time: '9:00 AM',
      serviceIds: ['service-deshedding', 'service-nail-trim'],
      customerId: 'customer-lena-harris',
      petId: 'pet-milo',
      staffId: 'staff-sarah-johnson',
      status: 'completed',
      notes: 'Extended deshedding session ahead of family photos.',
      paymentMethod: 'card',
      rating: 5
    },
    {
      dayOffset: 1,
      time: '1:00 PM',
      serviceIds: ['service-bath-brush'],
      customerId: 'customer-grace-kim',
      petId: 'pet-luna',
      staffId: 'staff-emily-rodriguez',
      status: 'completed',
      notes: 'Added seasonal bow at pickup.',
      paymentMethod: 'card',
      rating: 5
    },
    {
      dayOffset: 2,
      time: '11:00 AM',
      serviceIds: ['service-full-groom', 'service-spa-day'],
      customerId: 'customer-evan-brooks',
      petId: 'pet-bella',
      staffId: 'staff-sarah-johnson',
      status: 'confirmed',
      notes: 'Therapy visit scheduled tomorrow—finish with calming spray.',
      groomerRequested: true,
      paymentMethod: 'card'
    },
    {
      dayOffset: 2,
      time: '2:30 PM',
      serviceIds: ['service-nail-trim'],
      customerId: 'customer-jamal-ortiz',
      petId: 'pet-rocky',
      staffId: 'staff-mike-chen',
      status: 'scheduled',
      notes: 'Quick maintenance nail trim between full grooms.',
      paymentMethod: 'card'
    },
    {
      dayOffset: 3,
      time: '9:30 AM',
      serviceIds: ['service-bath-brush', 'service-deshedding'],
      customerId: 'customer-priya-patel',
      petId: 'pet-nala',
      staffId: 'staff-mike-chen',
      status: 'confirmed',
      notes: 'Needs to be out by 1:00 PM for training.',
      paymentMethod: 'card'
    },
    {
      dayOffset: 3,
      time: '12:30 PM',
      serviceIds: ['service-bath-brush'],
      customerId: 'customer-priya-patel',
      petId: 'pet-simba',
      staffId: 'staff-emily-rodriguez',
      status: 'confirmed',
      notes: 'Handle gently—Simba prefers warm towels.',
      paymentMethod: 'card'
    },
    {
      dayOffset: 4,
      time: '10:00 AM',
      serviceIds: ['service-full-groom', 'service-teeth-brushing'],
      customerId: 'customer-grace-kim',
      petId: 'pet-duke',
      staffId: 'staff-sarah-johnson',
      status: 'in-progress',
      notes: 'Two-person lift needed. Client requested photo update.',
      paymentMethod: 'card'
    },
    {
      dayOffset: 5,
      time: '9:00 AM',
      serviceIds: ['service-bath-brush', 'service-spa-day'],
      customerId: 'customer-evan-brooks',
      petId: 'pet-bella',
      staffId: 'staff-emily-rodriguez',
      status: 'scheduled',
      notes: 'Prep for weekend therapy event.',
      groomerRequested: true,
      paymentMethod: 'card'
    },
    {
      dayOffset: 5,
      time: '12:30 PM',
      serviceIds: ['service-bath-brush'],
      customerId: 'customer-lena-harris',
      petId: 'pet-poppy',
      staffId: 'staff-mike-chen',
      status: 'scheduled',
      notes: 'Trim feathering lightly—show event coming up.',
      paymentMethod: 'card'
    },
    {
      dayOffset: 6,
      time: '11:30 AM',
      serviceIds: ['service-full-groom', 'service-teeth-brushing'],
      customerId: 'customer-priya-patel',
      petId: 'pet-nala',
      staffId: 'staff-sarah-johnson',
      status: 'scheduled',
      notes: 'Weekend maintenance before Monday training rotation.',
      paymentMethod: 'card'
    }
  ]

  return templates.map((template, index) => {
    const appointmentDate = addDays(weekStart, template.dayOffset)
    const date = format(appointmentDate, 'yyyy-MM-dd')
    const startMinutes = toMinutes(template.time)
    const totalDuration = template.serviceIds.reduce((sum, serviceId) => {
      const service = serviceMap.get(serviceId)
      return sum + (service?.duration ?? 0)
    }, 0)
    const price = template.priceOverride ?? template.serviceIds.reduce((sum, serviceId) => {
      const service = serviceMap.get(serviceId)
      if (!service) return sum
      return sum + (service.basePrice ?? service.price ?? 0)
    }, 0)
    const customer = customerMap.get(template.customerId)
    const pet = customer?.pets.find(p => p.id === template.petId)

    const serviceNames = template.serviceIds
      .map(serviceId => serviceMap.get(serviceId)?.name)
      .filter(Boolean)
      .join(' + ')

    const endMinutes = startMinutes + totalDuration

    const id = `apt-${format(appointmentDate, 'yyyyMMdd')}-${index + 1}`

    return {
      id,
      petId: template.petId,
      petName: pet?.name ?? 'Unknown Pet',
      customerId: template.customerId,
      customerFirstName: customer?.firstName ?? 'Client',
      customerLastName: customer?.lastName ?? 'Name',
      serviceId: template.serviceIds[0],
      serviceIds: template.serviceIds,
      service: serviceNames,
      staffId: template.staffId,
      groomerRequested: template.groomerRequested,
      date,
      time: template.time,
      endTime: toTimeLabel(endMinutes),
      duration: totalDuration,
      price,
      status: template.status,
      notes: template.notes,
      reminderSent: template.reminderSent ?? true,
      confirmationSent: template.confirmationSent ?? true,
      pickupNotificationSent: template.pickupNotificationSent,
      pickupNotificationAcknowledged: template.pickupNotificationSent ? false : undefined,
      checkInTime:
        template.status === 'completed' || template.status === 'in-progress'
          ? toIsoDateTime(date, startMinutes)
          : undefined,
      checkOutTime:
        template.status === 'completed'
          ? toIsoDateTime(date, endMinutes)
          : undefined,
      paymentCompleted: template.status === 'completed',
      paymentMethod: template.paymentMethod,
      amountPaid: template.status === 'completed' ? price : undefined,
      pickedUpTime:
        template.status === 'completed'
          ? toIsoDateTime(date, endMinutes + 15)
          : undefined,
      createdAt: nowIso,
      rating: template.rating
    }
  })
}

export function DataInitializer() {
  const [services, setServices] = useKV<Service[]>('services', [])
  const [staffMembers, setStaffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])

  const shouldSeed = useMemo(() => {
    return (
      (services?.length ?? 0) === 0 ||
      (staffMembers?.length ?? 0) === 0 ||
      (customers?.length ?? 0) === 0 ||
      (appointments?.length ?? 0) === 0
    )
  }, [appointments?.length, customers?.length, services?.length, staffMembers?.length])

  useEffect(() => {
    if (!shouldSeed) {
      return
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })

    const seededServices = buildDefaultServices(nowIso)
    const seededStaff = buildDefaultStaff(nowIso)
    const seededCustomers = buildDefaultCustomers(nowIso)
    const seededAppointments = buildDefaultAppointments(weekStart, seededServices, seededCustomers, nowIso)

    if (!services || services.length === 0) {
      setServices(seededServices)
    }
    if (!staffMembers || staffMembers.length === 0) {
      setStaffMembers(seededStaff)
    }
    if (!customers || customers.length === 0) {
      setCustomers(seededCustomers)
    }
    if (!appointments || appointments.length === 0) {
      setAppointments(seededAppointments)
    }
  }, [shouldSeed, services, staffMembers, customers, appointments, setServices, setStaffMembers, setCustomers, setAppointments])

  return null
}

export default DataInitializer
