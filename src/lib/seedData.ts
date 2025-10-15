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

  const customers: Customer[] = [
    {
      id: 'customer-1',
      name: 'Jennifer Williams',
      email: 'jennifer.w@email.com',
      phone: '(555) 111-2222',
      pets: [
        {
          id: 'pet-1',
          name: 'Max',
          breed: 'Golden Retriever',
          size: 'large',
          age: 3
        }
      ]
    },
    {
      id: 'customer-2',
      name: 'Robert Davis',
      email: 'robert.d@email.com',
      phone: '(555) 222-3333',
      pets: [
        {
          id: 'pet-2',
          name: 'Bella',
          breed: 'Poodle',
          size: 'medium',
          age: 2
        }
      ]
    },
    {
      id: 'customer-3',
      name: 'Maria Garcia',
      email: 'maria.g@email.com',
      phone: '(555) 333-4444',
      pets: [
        {
          id: 'pet-3',
          name: 'Charlie',
          breed: 'Yorkshire Terrier',
          size: 'small',
          age: 5
        }
      ]
    },
    {
      id: 'customer-4',
      name: 'David Martinez',
      email: 'david.m@email.com',
      phone: '(555) 444-5555',
      pets: [
        {
          id: 'pet-4',
          name: 'Luna',
          breed: 'Labrador',
          size: 'large',
          age: 4
        }
      ]
    },
    {
      id: 'customer-5',
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      phone: '(555) 555-6666',
      pets: [
        {
          id: 'pet-5',
          name: 'Rocky',
          breed: 'Beagle',
          size: 'medium',
          age: 6
        }
      ]
    },
    {
      id: 'customer-6',
      name: 'James Wilson',
      email: 'james.w@email.com',
      phone: '(555) 666-7777',
      pets: [
        {
          id: 'pet-6',
          name: 'Daisy',
          breed: 'Shih Tzu',
          size: 'small',
          age: 2
        }
      ]
    },
    {
      id: 'customer-7',
      name: 'Patricia Brown',
      email: 'patricia.b@email.com',
      phone: '(555) 777-8888',
      pets: [
        {
          id: 'pet-7',
          name: 'Cooper',
          breed: 'German Shepherd',
          size: 'large',
          age: 5
        }
      ]
    },
    {
      id: 'customer-8',
      name: 'Michael Taylor',
      email: 'michael.t@email.com',
      phone: '(555) 888-9999',
      pets: [
        {
          id: 'pet-8',
          name: 'Sadie',
          breed: 'Cocker Spaniel',
          size: 'medium',
          age: 3
        }
      ]
    },
    {
      id: 'customer-9',
      name: 'Sarah Miller',
      email: 'sarah.m@email.com',
      phone: '(555) 999-0000',
      pets: [
        {
          id: 'pet-9',
          name: 'Buddy',
          breed: 'French Bulldog',
          size: 'medium',
          age: 4
        }
      ]
    },
    {
      id: 'customer-10',
      name: 'Christopher Lee',
      email: 'chris.l@email.com',
      phone: '(555) 101-1111',
      pets: [
        {
          id: 'pet-10',
          name: 'Molly',
          breed: 'Border Collie',
          size: 'medium',
          age: 2
        }
      ]
    }
  ]

  const appointments: Appointment[] = []
  const transactions: Transaction[] = []

  const now = new Date()
  const paymentMethods: ('cash' | 'card' | 'cashapp' | 'chime')[] = ['cash', 'card', 'cashapp', 'chime']
  const statuses: ('completed' | 'no-show' | 'cancelled')[] = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'no-show', 'cancelled']

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const appointmentDate = new Date(now)
    appointmentDate.setDate(appointmentDate.getDate() - dayOffset)
    
    const appointmentsPerDay = Math.floor(Math.random() * 5) + 8
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const pet = customer.pets[0]
      const staffMember = staff[Math.floor(Math.random() * staff.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      const isFullGroom = Math.random() > 0.4
      const selectedServices = isFullGroom 
        ? ['service-1', Math.random() > 0.5 ? 'service-3' : null, Math.random() > 0.7 ? 'service-4' : null].filter(Boolean) as string[]
        : ['service-2', Math.random() > 0.3 ? 'service-3' : null].filter(Boolean) as string[]
      
      const totalPrice = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id === serviceId)
        return sum + (service?.price || 0)
      }, 0)
      
      const totalDuration = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id === serviceId)
        return sum + (service?.duration || 0)
      }, 0)
      
      const hour = 9 + Math.floor(Math.random() * 7)
      const minute = Math.random() > 0.5 ? '00' : '30'
      
      const appointmentId = `apt-${dayOffset}-${i}`
      
      appointments.push({
        id: appointmentId,
        petId: pet.id,
        customerId: customer.id,
        serviceIds: selectedServices,
        staffId: staffMember.id,
        date: appointmentDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:${minute}`,
        duration: totalDuration,
        status,
        price: totalPrice,
        checkInTime: status === 'completed' ? `${hour.toString().padStart(2, '0')}:${minute}` : undefined,
        checkOutTime: status === 'completed' ? `${(hour + Math.ceil(totalDuration / 60)).toString().padStart(2, '0')}:${minute}` : undefined
      })
      
      if (status === 'completed') {
        const subtotal = totalPrice
        const tax = subtotal * 0.08
        const tip = Math.floor(Math.random() * 4) === 0 ? 0 : Math.floor(subtotal * (0.15 + Math.random() * 0.15))
        const discount = Math.random() > 0.9 ? Math.floor(subtotal * 0.1) : 0
        
        transactions.push({
          id: `txn-${dayOffset}-${i}`,
          date: appointmentDate.toISOString().split('T')[0],
          customerId: customer.id,
          staffId: staffMember.id,
          items: selectedServices.map(serviceId => {
            const service = services.find(s => s.id === serviceId)!
            return {
              id: service.id,
              name: service.name,
              price: service.price,
              quantity: 1
            }
          }),
          subtotal,
          tax,
          tip,
          total: subtotal + tax + tip - discount,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          discount
        })
      }
    }
  }

  return {
    staff,
    services,
    customers,
    appointments,
    transactions
  }
}
