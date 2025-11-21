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

  // Demo customers with pets
  const customers: Array<{
    id: string
    firstName: string
    lastName: string
    name: string
    phone: string
    email: string
    address?: string
    city?: string
    state?: string
    zip?: string
    notes?: string
    createdAt: string
    pets: Array<{
      id: string
      name: string
      breed: string
      size: 'small' | 'medium' | 'large'
      notes?: string
    }>
  }> = [
    {
      id: 'customer-1',
      firstName: 'Jennifer',
      lastName: 'Thompson',
      name: 'Jennifer Thompson',
      phone: '(555) 234-5678',
      email: 'jennifer.thompson@email.com',
      address: '123 Oak Avenue',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      notes: 'Prefers morning appointments',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-1',
          name: 'Max',
          breed: 'Golden Retriever',
          size: 'large',
          notes: 'Very friendly, loves treats'
        },
        {
          id: 'pet-2',
          name: 'Luna',
          breed: 'Poodle',
          size: 'medium',
          notes: 'Sensitive to loud noises'
        }
      ]
    },
    {
      id: 'customer-2',
      firstName: 'Robert',
      lastName: 'Martinez',
      name: 'Robert Martinez',
      phone: '(555) 345-6789',
      email: 'robert.martinez@email.com',
      address: '456 Pine Street',
      city: 'Austin',
      state: 'TX',
      zip: '78702',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-3',
          name: 'Bella',
          breed: 'Yorkshire Terrier',
          size: 'small',
          notes: 'Needs gentle handling'
        }
      ]
    },
    {
      id: 'customer-3',
      firstName: 'Lisa',
      lastName: 'Anderson',
      name: 'Lisa Anderson',
      phone: '(555) 456-7890',
      email: 'lisa.anderson@email.com',
      address: '789 Maple Drive',
      city: 'Austin',
      state: 'TX',
      zip: '78703',
      notes: 'Regular customer, weekly appointments',
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-4',
          name: 'Charlie',
          breed: 'Labrador Retriever',
          size: 'large',
          notes: 'Energetic, needs firm handling'
        },
        {
          id: 'pet-5',
          name: 'Daisy',
          breed: 'Beagle',
          size: 'medium',
          notes: 'Food motivated'
        }
      ]
    },
    {
      id: 'customer-4',
      firstName: 'Michael',
      lastName: 'Chen',
      name: 'Michael Chen',
      phone: '(555) 567-8901',
      email: 'michael.chen@email.com',
      address: '321 Birch Lane',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-6',
          name: 'Rocky',
          breed: 'German Shepherd',
          size: 'large',
          notes: 'Protective, experienced groomers only'
        }
      ]
    },
    {
      id: 'customer-5',
      firstName: 'Sarah',
      lastName: 'Williams',
      name: 'Sarah Williams',
      phone: '(555) 678-9012',
      email: 'sarah.williams@email.com',
      address: '654 Cedar Court',
      city: 'Austin',
      state: 'TX',
      zip: '78705',
      notes: 'Show dog owner',
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-7',
          name: 'Princess',
          breed: 'Shih Tzu',
          size: 'small',
          notes: 'Show cuts required'
        }
      ]
    },
    {
      id: 'customer-6',
      firstName: 'David',
      lastName: 'Brown',
      name: 'David Brown',
      phone: '(555) 789-0123',
      email: 'david.brown@email.com',
      address: '987 Elm Boulevard',
      city: 'Austin',
      state: 'TX',
      zip: '78706',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      pets: [
        {
          id: 'pet-8',
          name: 'Cooper',
          breed: 'Australian Shepherd',
          size: 'medium',
          notes: 'High energy, loves water'
        }
      ]
    }
  ]

  // Demo appointments spanning the last 30 days and next 7 days
  const appointments: Array<{
    id: string
    petId: string
    petName: string
    customerId: string
    customerFirstName: string
    customerLastName: string
    serviceIds?: string[]
    service?: string
    serviceId?: string
    staffId: string
    date: string
    time: string
    duration: number
    status: 'completed' | 'no-show' | 'cancelled' | 'scheduled' | 'confirmed' | 'checked-in'
    price: number
    notes: string
    checkInTime?: string
    checkOutTime?: string
    createdAt: string
  }> = []
  
  // Helper to generate appointment times
  const appointmentTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
  
  // Past appointments (last 30 days)
  const pastAppointments = [
    // Week 1 (3 weeks ago)
    {
      petId: 'pet-1',
      petName: 'Max',
      customerId: 'customer-1',
      customerFirstName: 'Jennifer',
      customerLastName: 'Thompson',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-1',
      date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '9:00 AM',
      duration: 120,
      status: 'completed' as const,
      price: 85,
      notes: 'Customer very satisfied'
    },
    {
      petId: 'pet-3',
      petName: 'Bella',
      customerId: 'customer-2',
      customerFirstName: 'Robert',
      customerLastName: 'Martinez',
      serviceId: 'service-2',
      service: 'Bath & Brush',
      staffId: 'staff-3',
      date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      duration: 60,
      status: 'completed' as const,
      price: 45,
      notes: ''
    },
    // Week 2 (2 weeks ago)
    {
      petId: 'pet-4',
      petName: 'Charlie',
      customerId: 'customer-3',
      customerFirstName: 'Lisa',
      customerLastName: 'Anderson',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-2',
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 120,
      status: 'completed' as const,
      price: 85,
      notes: 'Regular customer'
    },
    {
      petId: 'pet-2',
      petName: 'Luna',
      customerId: 'customer-1',
      customerFirstName: 'Jennifer',
      customerLastName: 'Thompson',
      serviceId: 'service-4',
      service: 'De-shedding Treatment',
      staffId: 'staff-2',
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '2:00 PM',
      duration: 45,
      status: 'completed' as const,
      price: 35,
      notes: ''
    },
    {
      petId: 'pet-7',
      petName: 'Princess',
      customerId: 'customer-5',
      customerFirstName: 'Sarah',
      customerLastName: 'Williams',
      serviceId: 'service-6',
      service: 'Show Cut',
      staffId: 'staff-1',
      date: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '9:00 AM',
      duration: 180,
      status: 'completed' as const,
      price: 150,
      notes: 'Preparing for competition'
    },
    // Week 3 (1 week ago)
    {
      petId: 'pet-6',
      petName: 'Rocky',
      customerId: 'customer-4',
      customerFirstName: 'Michael',
      customerLastName: 'Chen',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-1',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      duration: 120,
      status: 'completed' as const,
      price: 85,
      notes: 'Handled professionally'
    },
    {
      petId: 'pet-5',
      petName: 'Daisy',
      customerId: 'customer-3',
      customerFirstName: 'Lisa',
      customerLastName: 'Anderson',
      serviceId: 'service-2',
      service: 'Bath & Brush',
      staffId: 'staff-4',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '1:00 PM',
      duration: 60,
      status: 'completed' as const,
      price: 45,
      notes: 'Good behavior'
    },
    {
      petId: 'pet-8',
      petName: 'Cooper',
      customerId: 'customer-6',
      customerFirstName: 'David',
      customerLastName: 'Brown',
      serviceId: 'service-4',
      service: 'De-shedding Treatment',
      staffId: 'staff-2',
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '3:00 PM',
      duration: 45,
      status: 'completed' as const,
      price: 35,
      notes: ''
    },
    // This week (recent)
    {
      petId: 'pet-1',
      petName: 'Max',
      customerId: 'customer-1',
      customerFirstName: 'Jennifer',
      customerLastName: 'Thompson',
      serviceId: 'service-3',
      service: 'Nail Trim',
      staffId: 'staff-4',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 15,
      status: 'completed' as const,
      price: 15,
      notes: ''
    },
    {
      petId: 'pet-3',
      petName: 'Bella',
      customerId: 'customer-2',
      customerFirstName: 'Robert',
      customerLastName: 'Martinez',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-3',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '2:00 PM',
      duration: 120,
      status: 'completed' as const,
      price: 85,
      notes: 'Excellent result'
    }
  ]
  
  // Upcoming appointments (next 7 days)
  const upcomingAppointments = [
    // Today
    {
      petId: 'pet-4',
      petName: 'Charlie',
      customerId: 'customer-3',
      customerFirstName: 'Lisa',
      customerLastName: 'Anderson',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-1',
      date: now.toISOString().split('T')[0],
      time: '9:00 AM',
      duration: 120,
      status: 'confirmed' as const,
      price: 85,
      notes: 'Regular weekly appointment'
    },
    {
      petId: 'pet-2',
      petName: 'Luna',
      customerId: 'customer-1',
      customerFirstName: 'Jennifer',
      customerLastName: 'Thompson',
      serviceId: 'service-2',
      service: 'Bath & Brush',
      staffId: 'staff-2',
      date: now.toISOString().split('T')[0],
      time: '2:00 PM',
      duration: 60,
      status: 'scheduled' as const,
      price: 45,
      notes: ''
    },
    // Tomorrow
    {
      petId: 'pet-6',
      petName: 'Rocky',
      customerId: 'customer-4',
      customerFirstName: 'Michael',
      customerLastName: 'Chen',
      serviceId: 'service-4',
      service: 'De-shedding Treatment',
      staffId: 'staff-1',
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      duration: 45,
      status: 'scheduled' as const,
      price: 35,
      notes: ''
    },
    {
      petId: 'pet-8',
      petName: 'Cooper',
      customerId: 'customer-6',
      customerFirstName: 'David',
      customerLastName: 'Brown',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-2',
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '3:00 PM',
      duration: 120,
      status: 'confirmed' as const,
      price: 85,
      notes: 'First full groom'
    },
    // Day after tomorrow
    {
      petId: 'pet-7',
      petName: 'Princess',
      customerId: 'customer-5',
      customerFirstName: 'Sarah',
      customerLastName: 'Williams',
      serviceId: 'service-5',
      service: 'Teeth Brushing',
      staffId: 'staff-3',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 15,
      status: 'scheduled' as const,
      price: 20,
      notes: ''
    },
    {
      petId: 'pet-5',
      petName: 'Daisy',
      customerId: 'customer-3',
      customerFirstName: 'Lisa',
      customerLastName: 'Anderson',
      serviceId: 'service-3',
      service: 'Nail Trim',
      staffId: 'staff-4',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '1:00 PM',
      duration: 15,
      status: 'scheduled' as const,
      price: 15,
      notes: ''
    },
    // Later this week
    {
      petId: 'pet-1',
      petName: 'Max',
      customerId: 'customer-1',
      customerFirstName: 'Jennifer',
      customerLastName: 'Thompson',
      serviceId: 'service-1',
      service: 'Full Groom',
      staffId: 'staff-1',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '9:00 AM',
      duration: 120,
      status: 'scheduled' as const,
      price: 85,
      notes: ''
    },
    {
      petId: 'pet-3',
      petName: 'Bella',
      customerId: 'customer-2',
      customerFirstName: 'Robert',
      customerLastName: 'Martinez',
      serviceId: 'service-2',
      service: 'Bath & Brush',
      staffId: 'staff-3',
      date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      duration: 60,
      status: 'scheduled' as const,
      price: 45,
      notes: ''
    }
  ]
  
  // Combine and format appointments
  const allAppointments = [...pastAppointments, ...upcomingAppointments]
  allAppointments.forEach((apt, index) => {
    const serviceIds = apt.serviceId ? [apt.serviceId] : []
    appointments.push({
      id: `appointment-${index + 1}`,
      petId: apt.petId,
      petName: apt.petName,
      customerId: apt.customerId,
      customerFirstName: apt.customerFirstName,
      customerLastName: apt.customerLastName,
      serviceIds,
      service: apt.service,
      serviceId: apt.serviceId,
      staffId: apt.staffId,
      date: apt.date,
      time: apt.time,
      duration: apt.duration,
      status: apt.status,
      price: apt.price,
      notes: apt.notes,
      createdAt: new Date(now.getTime() - (30 - index) * 24 * 60 * 60 * 1000).toISOString()
    })
  })
  
  // Generate transactions for completed appointments
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
  
  const paymentMethods: Array<'cash' | 'card' | 'cashapp' | 'chime'> = ['cash', 'card', 'cashapp', 'chime']
  const tipAmounts = [0, 5, 10, 15, 20]
  
  // Create transactions for completed appointments (will be populated after appointments array is built)
  let transactionIndex = 0
  appointments
    .filter(apt => apt.status === 'completed')
    .forEach((apt) => {
      const serviceId = apt.serviceIds?.[0] || apt.serviceId
      const service = services.find(s => s.id === serviceId)
      if (!service) return
      
      const subtotal = apt.price
      const tax = subtotal * 0.0825 // Texas sales tax
      const tip = tipAmounts[transactionIndex % tipAmounts.length]
      const total = subtotal + tax + tip
      
      transactions.push({
        id: `transaction-${transactionIndex + 1}`,
        date: apt.date,
        customerId: apt.customerId,
        staffId: apt.staffId,
        items: [
          {
            id: service.id,
            name: service.name,
            price: apt.price,
            quantity: 1
          }
        ],
        subtotal,
        tax,
        tip,
        total,
        paymentMethod: paymentMethods[transactionIndex % paymentMethods.length]
      })
      transactionIndex++
    })

  return {
    staff,
    services,
    customers,
    appointments,
    transactions
  }
}
