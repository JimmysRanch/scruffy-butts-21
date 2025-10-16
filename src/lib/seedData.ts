export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  pets: Pet[]
  address?: string
  notes?: string
}

export interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  age?: number
  notes?: string
  avatarUrl?: string
}

export interface Staff {
  id: string
  name: string
  role: string
  color: string
  phone: string
  email: string
  specialties: string[]
  hourlyRate: number
  commissionRate: number
  schedule?: {
    monday?: { start: string; end: string; canBook: boolean; services: string[] }
    tuesday?: { start: string; end: string; canBook: boolean; services: string[] }
    wednesday?: { start: string; end: string; canBook: boolean; services: string[] }
    thursday?: { start: string; end: string; canBook: boolean; services: string[] }
    friday?: { start: string; end: string; canBook: boolean; services: string[] }
    saturday?: { start: string; end: string; canBook: boolean; services: string[] }
    sunday?: { start: string; end: string; canBook: boolean; services: string[] }
  }
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
  description?: string
  petSizes?: string[]
}

export interface Appointment {
  id: string
  petId: string
  customerId: string
  serviceIds: string[]
  staffId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  price: number
  checkInTime?: string
  checkOutTime?: string
}

export interface Transaction {
  id: string
  date: string
  customerId: string
  staffId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
  discount?: number
  refund?: number
}

export function generateSeedData() {
  const staff: Staff[] = [
    {
      id: 'staff-1',
      name: 'Sarah Johnson',
      role: 'Master Groomer',
      color: '#6366f1',
      phone: '(555) 123-4567',
      email: 'sarah@scruffybutts.com',
      specialties: ['Full Groom', 'Breed Styling', 'Hand Stripping'],
      hourlyRate: 25,
      commissionRate: 0.35,
      schedule: {
        monday: { start: '08:00', end: '17:00', canBook: true, services: [] },
        tuesday: { start: '08:00', end: '17:00', canBook: true, services: [] },
        wednesday: { start: '08:00', end: '17:00', canBook: true, services: [] },
        thursday: { start: '08:00', end: '17:00', canBook: true, services: [] },
        friday: { start: '08:00', end: '17:00', canBook: true, services: [] },
        saturday: { start: '09:00', end: '15:00', canBook: true, services: [] }
      }
    },
    {
      id: 'staff-2',
      name: 'Mike Chen',
      role: 'Senior Groomer',
      color: '#8b5cf6',
      phone: '(555) 234-5678',
      email: 'mike@scruffybutts.com',
      specialties: ['Full Groom', 'Deshedding', 'Nail Trim'],
      hourlyRate: 22,
      commissionRate: 0.30,
      schedule: {
        monday: { start: '09:00', end: '18:00', canBook: true, services: [] },
        tuesday: { start: '09:00', end: '18:00', canBook: true, services: [] },
        wednesday: { start: '09:00', end: '18:00', canBook: true, services: [] },
        thursday: { start: '09:00', end: '18:00', canBook: true, services: [] },
        friday: { start: '09:00', end: '18:00', canBook: true, services: [] }
      }
    },
    {
      id: 'staff-3',
      name: 'Emily Rodriguez',
      role: 'Groomer',
      color: '#ec4899',
      phone: '(555) 345-6789',
      email: 'emily@scruffybutts.com',
      specialties: ['Bath & Brush', 'Nail Trim', 'Teeth Brushing'],
      hourlyRate: 18,
      commissionRate: 0.25,
      schedule: {
        tuesday: { start: '10:00', end: '18:00', canBook: true, services: [] },
        wednesday: { start: '10:00', end: '18:00', canBook: true, services: [] },
        thursday: { start: '10:00', end: '18:00', canBook: true, services: [] },
        friday: { start: '10:00', end: '18:00', canBook: true, services: [] },
        saturday: { start: '08:00', end: '16:00', canBook: true, services: [] }
      }
    },
    {
      id: 'staff-4',
      name: 'Alex Thompson',
      role: 'Bather',
      color: '#10b981',
      phone: '(555) 456-7890',
      email: 'alex@scruffybutts.com',
      specialties: ['Bath', 'Brush Out', 'Nail Trim'],
      hourlyRate: 15,
      commissionRate: 0.20,
      schedule: {
        monday: { start: '08:00', end: '16:00', canBook: true, services: [] },
        tuesday: { start: '08:00', end: '16:00', canBook: true, services: [] },
        wednesday: { start: '08:00', end: '16:00', canBook: true, services: [] },
        thursday: { start: '08:00', end: '16:00', canBook: true, services: [] },
        friday: { start: '08:00', end: '16:00', canBook: true, services: [] }
      }
    }
  ]

  const services: Service[] = [
    {
      id: 'service-1',
      name: 'Full Groom',
      duration: 120,
      price: 85,
      category: 'Grooming',
      description: 'Complete grooming package including bath, haircut, nail trim, and ear cleaning',
      petSizes: ['small', 'medium', 'large']
    },
    {
      id: 'service-2',
      name: 'Bath & Brush',
      duration: 60,
      price: 45,
      category: 'Bath',
      description: 'Thorough bath and brush out',
      petSizes: ['small', 'medium', 'large']
    },
    {
      id: 'service-3',
      name: 'Nail Trim',
      duration: 15,
      price: 15,
      category: 'Add-On',
      description: 'Professional nail trimming and filing',
      petSizes: ['small', 'medium', 'large']
    },
    {
      id: 'service-4',
      name: 'Teeth Brushing',
      duration: 15,
      price: 12,
      category: 'Add-On',
      description: 'Gentle teeth brushing and breath freshening',
      petSizes: ['small', 'medium', 'large']
    },
    {
      id: 'service-5',
      name: 'Deshedding Treatment',
      duration: 45,
      price: 35,
      category: 'Treatment',
      description: 'Specialized treatment to reduce shedding',
      petSizes: ['medium', 'large']
    },
    {
      id: 'service-6',
      name: 'Flea & Tick Treatment',
      duration: 30,
      price: 25,
      category: 'Treatment',
      description: 'Flea and tick prevention treatment',
      petSizes: ['small', 'medium', 'large']
    }
  ]

  const customers: Customer[] = []

  const appointments: Appointment[] = []
  const transactions: Transaction[] = []

  return {
    staff,
    services,
    customers,
    appointments,
    transactions
  }
}
