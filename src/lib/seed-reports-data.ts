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
  
  for (let i = 1; i <= 50; i++) {
    customers.push({
      id: `customer-${i}`,
      name: `Customer ${i}`,
      phone: `555-${String(1000 + i).slice(-4)}`,
      email: `customer${i}@example.com`,
      pets: [`pet-${i}`]
    })
  }

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
    paymentMethod: 'cash' | 'card'
  }> = []
  
  let appointmentId = 1
  let transactionId = 1

  for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    const dateStr = date.toISOString().split('T')[0]
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const appointmentsPerDay = isWeekend ? 8 : 15
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const staffMember = staff[Math.floor(Math.random() * staff.length)]
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const service = services[Math.floor(Math.random() * services.length)]
      
      const hour = 9 + Math.floor(Math.random() * 8)
      const minute = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)]
      const time = `${String(hour).padStart(2, '0')}:${minute}`
      
      const statusRoll = Math.random()
      let status: 'completed' | 'no-show' | 'cancelled' | 'scheduled'
      
      if (dayOffset === 0) {
        status = Math.random() > 0.3 ? 'completed' : 'scheduled'
      } else if (dayOffset <= 3) {
        if (statusRoll < 0.75) status = 'completed'
        else if (statusRoll < 0.85) status = 'no-show'
        else status = 'cancelled'
      } else {
        if (statusRoll < 0.85) status = 'completed'
        else if (statusRoll < 0.93) status = 'no-show'
        else status = 'cancelled'
      }
      
      const hasAdditionalService = Math.random() > 0.6
      const serviceIds = [service.id]
      let totalPrice = service.price
      let totalDuration = service.duration
      
      if (hasAdditionalService && service.id !== 'service-3') {
        serviceIds.push('service-3')
        totalPrice += 15
        totalDuration += 15
      }
      
      const appointment: {
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
      } = {
        id: `appointment-${appointmentId++}`,
        petId: customer.pets[0],
        customerId: customer.id,
        serviceIds,
        staffId: staffMember.id,
        date: dateStr,
        time,
        duration: totalDuration,
        status,
        price: totalPrice,
        notes: ''
      }
      
      if (status === 'completed') {
        appointment.checkInTime = time
        const checkOutHour = hour + Math.floor(totalDuration / 60)
        const checkOutMinute = (parseInt(minute) + (totalDuration % 60)) % 60
        appointment.checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}`
      }
      
      appointments.push(appointment)
      
      if (status === 'completed') {
        const tipAmount = Math.random() > 0.3 ? Math.round((totalPrice * (0.1 + Math.random() * 0.15)) * 100) / 100 : 0
        const tax = Math.round(totalPrice * 0.08 * 100) / 100
        
        const transaction = {
          id: `transaction-${transactionId++}`,
          date: dateStr,
          customerId: customer.id,
          staffId: staffMember.id,
          items: serviceIds.map(sid => {
            const svc = services.find(s => s.id === sid)!
            return {
              id: sid,
              name: svc.name,
              price: svc.price,
              quantity: 1
            }
          }),
          subtotal: totalPrice,
          tax,
          tip: tipAmount,
          total: totalPrice + tax + tipAmount,
          paymentMethod: Math.random() > 0.3 ? 'card' as const : 'cash' as const
        }
        
        transactions.push(transaction)
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
