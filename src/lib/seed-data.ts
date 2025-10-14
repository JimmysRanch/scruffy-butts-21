import { format, subDays, addHours, addMinutes } from 'date-fns'

export function generateSeedData() {
  const customers = [
    {
      id: 'cust-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '555-0101',
      address: '123 Oak Street',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      firstVisit: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      totalVisits: 12,
      totalSpent: 840.00,
      pets: [
        {
          id: 'pet-001',
          name: 'Buddy',
          breed: 'Golden Retriever',
          size: 'large' as const,
          age: 4,
          notes: 'Very friendly, loves treats'
        }
      ]
    },
    {
      id: 'cust-002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'mchen@email.com',
      phone: '555-0102',
      address: '456 Maple Ave',
      city: 'Portland',
      state: 'OR',
      zip: '97202',
      firstVisit: format(subDays(new Date(), 120), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      totalVisits: 8,
      totalSpent: 560.00,
      pets: [
        {
          id: 'pet-002',
          name: 'Luna',
          breed: 'French Bulldog',
          size: 'small' as const,
          age: 2,
          notes: 'Sensitive skin, use hypoallergenic products'
        }
      ]
    },
    {
      id: 'cust-003',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@email.com',
      phone: '555-0103',
      address: '789 Pine Street',
      city: 'Portland',
      state: 'OR',
      zip: '97203',
      firstVisit: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      totalVisits: 6,
      totalSpent: 480.00,
      pets: [
        {
          id: 'pet-003',
          name: 'Max',
          breed: 'Labrador Mix',
          size: 'medium' as const,
          age: 5,
          notes: 'Anxious around water'
        }
      ]
    },
    {
      id: 'cust-004',
      firstName: 'David',
      lastName: 'Williams',
      email: 'dwilliams@email.com',
      phone: '555-0104',
      address: '321 Elm Street',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
      firstVisit: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      totalVisits: 4,
      totalSpent: 320.00,
      pets: [
        {
          id: 'pet-004',
          name: 'Bella',
          breed: 'Poodle',
          size: 'small' as const,
          age: 3,
          notes: 'Requires gentle handling'
        },
        {
          id: 'pet-005',
          name: 'Charlie',
          breed: 'Beagle',
          size: 'medium' as const,
          age: 6,
          notes: 'Very energetic'
        }
      ]
    },
    {
      id: 'cust-005',
      firstName: 'Jessica',
      lastName: 'Taylor',
      email: 'jtaylor@email.com',
      phone: '555-0105',
      address: '654 Cedar Lane',
      city: 'Portland',
      state: 'OR',
      zip: '97205',
      firstVisit: format(subDays(new Date(), 200), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      totalVisits: 15,
      totalSpent: 1200.00,
      pets: [
        {
          id: 'pet-006',
          name: 'Rocky',
          breed: 'German Shepherd',
          size: 'large' as const,
          age: 7,
          notes: 'Senior dog, be gentle'
        }
      ]
    },
    {
      id: 'cust-006',
      firstName: 'Robert',
      lastName: 'Anderson',
      email: 'randerson@email.com',
      phone: '555-0106',
      address: '987 Birch Road',
      city: 'Portland',
      state: 'OR',
      zip: '97206',
      firstVisit: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      totalVisits: 3,
      totalSpent: 240.00,
      pets: [
        {
          id: 'pet-007',
          name: 'Daisy',
          breed: 'Shih Tzu',
          size: 'small' as const,
          age: 4,
          notes: 'Likes to be blow-dried'
        }
      ]
    },
    {
      id: 'cust-007',
      firstName: 'Amanda',
      lastName: 'Martinez',
      email: 'amartinez@email.com',
      phone: '555-0107',
      address: '147 Spruce Ave',
      city: 'Portland',
      state: 'OR',
      zip: '97207',
      firstVisit: format(subDays(new Date(), 150), 'yyyy-MM-dd'),
      lastVisit: format(subDays(new Date(), 120), 'yyyy-MM-dd'),
      totalVisits: 2,
      totalSpent: 160.00,
      pets: [
        {
          id: 'pet-008',
          name: 'Zeus',
          breed: 'Husky',
          size: 'large' as const,
          age: 3,
          notes: 'Thick double coat'
        }
      ]
    }
  ]

  const services = [
    {
      id: 'svc-001',
      name: 'Full Groom',
      category: 'Grooming',
      duration: 120,
      price: 85,
      basePrice: 85,
      description: 'Complete grooming service including bath, cut, and style',
      estimatedSupplyCost: 8,
      active: true
    },
    {
      id: 'svc-002',
      name: 'Bath & Brush',
      category: 'Grooming',
      duration: 60,
      price: 45,
      basePrice: 45,
      description: 'Bath, dry, and thorough brushing',
      estimatedSupplyCost: 5,
      active: true
    },
    {
      id: 'svc-003',
      name: 'Nail Trim',
      category: 'Add-on',
      duration: 15,
      price: 15,
      basePrice: 15,
      description: 'Nail trimming and filing',
      estimatedSupplyCost: 1,
      active: true
    },
    {
      id: 'svc-004',
      name: 'Teeth Cleaning',
      category: 'Add-on',
      duration: 30,
      price: 35,
      basePrice: 35,
      description: 'Professional teeth cleaning',
      estimatedSupplyCost: 3,
      active: true
    },
    {
      id: 'svc-005',
      name: 'De-shedding Treatment',
      category: 'Specialty',
      duration: 45,
      price: 55,
      basePrice: 55,
      description: 'Specialized treatment to reduce shedding',
      estimatedSupplyCost: 6,
      active: true
    },
    {
      id: 'svc-006',
      name: 'Puppy Intro Groom',
      category: 'Grooming',
      duration: 45,
      price: 40,
      basePrice: 40,
      description: 'Gentle introduction to grooming for puppies',
      estimatedSupplyCost: 4,
      active: true
    }
  ]

  const staff = [
    {
      id: 'staff-001',
      firstName: 'Jennifer',
      lastName: 'Smith',
      name: 'Jennifer Smith',
      role: 'Lead Groomer',
      email: 'jennifer@scruffybutts.com',
      phone: '555-1001',
      compensationModel: 'commission' as const,
      commissionRate: 45,
      employerBurdenPct: 15,
      color: '#4F46E5',
      active: true
    },
    {
      id: 'staff-002',
      firstName: 'Marcus',
      lastName: 'Thompson',
      name: 'Marcus Thompson',
      role: 'Senior Groomer',
      email: 'marcus@scruffybutts.com',
      phone: '555-1002',
      compensationModel: 'commission' as const,
      commissionRate: 40,
      employerBurdenPct: 15,
      color: '#10B981',
      active: true
    },
    {
      id: 'staff-003',
      firstName: 'Rachel',
      lastName: 'Kim',
      name: 'Rachel Kim',
      role: 'Groomer',
      email: 'rachel@scruffybutts.com',
      phone: '555-1003',
      compensationModel: 'hourly' as const,
      hourlyRate: 18,
      employerBurdenPct: 15,
      color: '#F59E0B',
      active: true
    }
  ]

  const appointments: any[] = []
  const transactions: any[] = []

  const serviceOptions = services.map(s => s.id)
  const staffOptions = staff.map(s => s.id)
  const customerPetPairs = customers.flatMap(c => c.pets.map(p => ({ customer: c, pet: p })))

  let appointmentIdCounter = 1
  let transactionIdCounter = 1

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const date = subDays(new Date(), daysAgo)
    
    const pair = customerPetPairs[Math.floor(Math.random() * customerPetPairs.length)]
    const serviceId = serviceOptions[Math.floor(Math.random() * serviceOptions.length)]
    const service = services.find(s => s.id === serviceId)!
    const staffId = staffOptions[Math.floor(Math.random() * staffOptions.length)]
    
    const hour = 9 + Math.floor(Math.random() * 8)
    const minute = Math.random() < 0.5 ? 0 : 30
    const appointmentTime = addMinutes(addHours(date, hour), minute)
    
    let status: 'completed' | 'scheduled' | 'cancelled' | 'no-show'
    if (daysAgo > 1) {
      const rand = Math.random()
      if (rand < 0.80) status = 'completed'
      else if (rand < 0.90) status = 'cancelled'
      else status = 'no-show'
    } else {
      status = 'scheduled'
    }
    
    const hasDiscount = Math.random() < 0.15
    const discount = hasDiscount ? service.price * 0.10 : 0
    
    const appointment = {
      id: `apt-${appointmentIdCounter++}`,
      petName: pair.pet.name,
      customerFirstName: pair.customer.firstName,
      customerLastName: pair.customer.lastName,
      customerId: pair.customer.id,
      service: service.name,
      serviceId: service.id,
      date: format(date, 'yyyy-MM-dd'),
      time: format(appointmentTime, 'h:mm a'),
      duration: service.duration,
      price: service.price,
      discount: discount,
      status: status,
      staffId: staffId,
      channel: Math.random() < 0.6 ? 'online' as const : Math.random() < 0.8 ? 'phone' as const : 'walk-in' as const,
      notes: Math.random() < 0.2 ? 'Customer requested extra attention to coat' : undefined
    }
    
    appointments.push(appointment)
    
    if (status === 'completed') {
      const hasTip = Math.random() < 0.70
      const tipAmount = hasTip ? Math.round((service.price - discount) * 0.15 * 100) / 100 : 0
      
      const subtotal = service.price - discount
      const tax = Math.round(subtotal * 0.08 * 100) / 100
      const total = subtotal + tax + tipAmount
      
      const hasAdditionalItems = Math.random() < 0.3
      const items = [
        {
          name: service.name,
          price: service.price,
          quantity: 1
        }
      ]
      
      if (hasAdditionalItems && serviceId !== 'svc-003') {
        items.push({
          name: 'Nail Trim',
          price: 15,
          quantity: 1
        })
      }
      
      const actualSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - discount
      const actualTax = Math.round(actualSubtotal * 0.08 * 100) / 100
      const actualTotal = actualSubtotal + actualTax + tipAmount
      
      const transaction = {
        id: `txn-${transactionIdCounter++}`,
        date: format(date, 'yyyy-MM-dd'),
        customerId: pair.customer.id,
        appointmentId: appointment.id,
        items: items,
        subtotal: actualSubtotal,
        tax: actualTax,
        tip: tipAmount,
        total: actualTotal,
        paymentMethod: Math.random() < 0.85 ? 'card' : 'cash'
      }
      
      transactions.push(transaction)
    }
  }

  appointments.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time)
    const dateB = new Date(b.date + ' ' + b.time)
    return dateB.getTime() - dateA.getTime()
  })

  transactions.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  return {
    customers,
    services,
    staff,
    appointments,
    transactions
  }
}
