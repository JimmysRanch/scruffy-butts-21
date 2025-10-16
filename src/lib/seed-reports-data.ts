export async function seedReportsData() {
  const now = new Date()
  
  const staff = [
    {
      id: 'staff-1',
      name: 'Sarah Johnson',
      role: 'Lead Groomer',
      color: '#6366f1',
      phone: '555-0101',
      email: 'sarah@scruffybutts.com',
      specialties: ['Full Groom', 'Show Cuts', 'Hand Stripping'],
      hourlyRate: 25,
      commissionRate: 0.4
    },
    {
      id: 'staff-2',
      name: 'Mike Chen',
      role: 'Senior Groomer',
      color: '#8b5cf6',
      phone: '555-0102',
      email: 'mike@scruffybutts.com',
      specialties: ['Bath & Brush', 'Nail Trim', 'De-shedding'],
      hourlyRate: 22,
      commissionRate: 0.35
    },
    {
      id: 'staff-3',
      name: 'Emily Rodriguez',
      role: 'Groomer',
      color: '#ec4899',
      phone: '555-0103',
      email: 'emily@scruffybutts.com',
      specialties: ['Full Groom', 'Puppy Cuts', 'Teeth Brushing'],
      hourlyRate: 20,
      commissionRate: 0.3
    },
    {
      id: 'staff-4',
      name: 'Alex Thompson',
      role: 'Bather',
      color: '#f59e0b',
      phone: '555-0104',
      email: 'alex@scruffybutts.com',
      specialties: ['Bath & Brush', 'Nail Trim'],
      hourlyRate: 18,
      commissionRate: 0.25
    }
  ]

  const services = [
    {
      id: 'service-1',
      name: 'Full Groom',
      description: 'Complete grooming service including bath, brush, haircut, nail trim, and ear cleaning',
      duration: 120,
      price: 85,
      category: 'Grooming',
      createdAt: new Date().toISOString()
    },
    {
      id: 'service-2',
      name: 'Bath & Brush',
      description: 'Basic bath with professional shampoo and thorough brushing',
      duration: 60,
      price: 45,
      category: 'Bathing',
      createdAt: new Date().toISOString()
    },
    {
      id: 'service-3',
      name: 'Nail Trim',
      description: 'Professional nail trimming and filing',
      duration: 15,
      price: 15,
      category: 'Maintenance',
      createdAt: new Date().toISOString()
    },
    {
      id: 'service-4',
      name: 'De-shedding Treatment',
      description: 'Special treatment to reduce shedding',
      duration: 45,
      price: 35,
      category: 'Specialty',
      createdAt: new Date().toISOString()
    },
    {
      id: 'service-5',
      name: 'Teeth Brushing',
      description: 'Professional dental cleaning and breath freshening',
      duration: 15,
      price: 20,
      category: 'Maintenance',
      createdAt: new Date().toISOString()
    },
    {
      id: 'service-6',
      name: 'Show Cut',
      description: 'Premium breed-specific grooming for shows and competitions',
      duration: 180,
      price: 150,
      category: 'Grooming',
      createdAt: new Date().toISOString()
    }
  ]

  const customers: Array<{
    id: string
    name: string
    phone: string
    email: string
    pets: string[]
  }> = []

  const appointments: Array<{
    id: string
    petId: string
    customerId: string
    serviceIds: string[]
    staffId: string
    date: string
    time: string
    duration: number
    status: 'completed' | 'no-show' | 'cancelled' | 'scheduled'
    price: number
    notes: string
    checkInTime?: string
    checkOutTime?: string
  }> = []
  
  const transactions: Array<{
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
  }> = []

  return {
    staff,
    services,
    customers,
    appointments,
    transactions
  }
}
