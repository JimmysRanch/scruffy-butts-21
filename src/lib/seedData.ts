export const seedData = async () => {
  const customers = [
    {
      id: 'cust-001',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Springfield',
      notes: 'Prefers morning appointments',
      pets: [
        {
          id: 'pet-001',
          name: 'Max',
          breed: 'Golden Retriever',
          age: 3,
          weight: 65,
          notes: 'Friendly, loves treats'
        },
        {
          id: 'pet-002',
          name: 'Bella',
          breed: 'Poodle',
          age: 5,
          weight: 45,
          notes: 'Sensitive skin, use hypoallergenic shampoo'
        }
      ]
    },
    {
      id: 'cust-002',
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '(555) 234-5678',
      address: '456 Maple Ave, Springfield',
      notes: 'Regular customer',
      pets: [
        {
          id: 'pet-003',
          name: 'Charlie',
          breed: 'Labrador',
          age: 2,
          weight: 70,
          notes: 'Very energetic'
        }
      ]
    },
    {
      id: 'cust-003',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '(555) 345-6789',
      address: '789 Pine Road, Springfield',
      notes: 'Prefers specific groomer',
      pets: [
        {
          id: 'pet-004',
          name: 'Luna',
          breed: 'Shih Tzu',
          age: 4,
          weight: 12,
          notes: 'Needs extra patience'
        }
      ]
    },
    {
      id: 'cust-004',
      name: 'David Thompson',
      email: 'dthompson@email.com',
      phone: '(555) 456-7890',
      address: '321 Elm Street, Springfield',
      notes: 'New customer',
      pets: [
        {
          id: 'pet-005',
          name: 'Rocky',
          breed: 'German Shepherd',
          age: 6,
          weight: 80,
          notes: 'Well-behaved'
        }
      ]
    },
    {
      id: 'cust-005',
      name: 'Jessica Martinez',
      email: 'jmartinez@email.com',
      phone: '(555) 567-8901',
      address: '654 Birch Lane, Springfield',
      notes: 'Monthly appointments',
      pets: [
        {
          id: 'pet-006',
          name: 'Daisy',
          breed: 'Beagle',
          age: 3,
          weight: 25,
          notes: 'Loves water'
        }
      ]
    },
    {
      id: 'cust-006',
      name: 'Robert Wilson',
      email: 'rwilson@email.com',
      phone: '(555) 678-9012',
      address: '987 Cedar Court, Springfield',
      notes: 'Prefers afternoon',
      pets: [
        {
          id: 'pet-007',
          name: 'Buddy',
          breed: 'Bulldog',
          age: 5,
          weight: 50,
          notes: 'Needs cooling breaks'
        }
      ]
    },
    {
      id: 'cust-007',
      name: 'Amanda Lee',
      email: 'alee@email.com',
      phone: '(555) 789-0123',
      address: '147 Willow Way, Springfield',
      notes: 'VIP customer',
      pets: [
        {
          id: 'pet-008',
          name: 'Coco',
          breed: 'Pomeranian',
          age: 2,
          weight: 8,
          notes: 'Show dog, needs premium styling'
        }
      ]
    },
    {
      id: 'cust-008',
      name: 'Christopher Davis',
      email: 'cdavis@email.com',
      phone: '(555) 890-1234',
      address: '258 Spruce Street, Springfield',
      notes: 'Flexible schedule',
      pets: [
        {
          id: 'pet-009',
          name: 'Zeus',
          breed: 'Rottweiler',
          age: 4,
          weight: 95,
          notes: 'Gentle giant'
        }
      ]
    },
    {
      id: 'cust-009',
      name: 'Lisa Anderson',
      email: 'landerson@email.com',
      phone: '(555) 901-2345',
      address: '369 Ash Avenue, Springfield',
      notes: 'Bi-weekly appointments',
      pets: [
        {
          id: 'pet-010',
          name: 'Milo',
          breed: 'Corgi',
          age: 3,
          weight: 28,
          notes: 'Shedding season'
        }
      ]
    },
    {
      id: 'cust-010',
      name: 'Daniel Brown',
      email: 'dbrown@email.com',
      phone: '(555) 012-3456',
      address: '741 Poplar Place, Springfield',
      notes: 'First time owner',
      pets: [
        {
          id: 'pet-011',
          name: 'Sophie',
          breed: 'Maltese',
          age: 1,
          weight: 6,
          notes: 'Puppy, getting used to grooming'
        }
      ]
    }
  ]

  const staff = [
    {
      id: 'staff-001',
      name: 'Jennifer Smith',
      role: 'Senior Groomer',
      email: 'jsmith@scruffybutts.com',
      phone: '(555) 111-2222',
      skills: ['Full Grooming', 'Breed Styling', 'Show Preparation'],
      schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false }
    },
    {
      id: 'staff-002',
      name: 'Alex Turner',
      role: 'Groomer',
      email: 'aturner@scruffybutts.com',
      phone: '(555) 222-3333',
      skills: ['Bath & Brush', 'Nail Trimming', 'Basic Grooming'],
      schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }
    },
    {
      id: 'staff-003',
      name: 'Maria Garcia',
      role: 'Senior Groomer',
      email: 'mgarcia@scruffybutts.com',
      phone: '(555) 333-4444',
      skills: ['Full Grooming', 'Breed Styling', 'Special Needs'],
      schedule: { monday: false, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }
    }
  ]

  const services = [
    { id: 'svc-001', name: 'Full Grooming', price: 65, duration: 120 },
    { id: 'svc-002', name: 'Bath & Brush', price: 45, duration: 60 },
    { id: 'svc-003', name: 'Nail Trim', price: 15, duration: 15 },
    { id: 'svc-004', name: 'Teeth Cleaning', price: 25, duration: 30 },
    { id: 'svc-005', name: 'De-shedding Treatment', price: 35, duration: 45 },
    { id: 'svc-006', name: 'Breed Styling', price: 85, duration: 150 },
    { id: 'svc-007', name: 'Ear Cleaning', price: 10, duration: 15 },
    { id: 'svc-008', name: 'Paw Pad Treatment', price: 20, duration: 20 }
  ]

  const appointments: any[] = []
  const transactions: any[] = []

  const startDate = new Date(2024, 9, 1)
  const endDate = new Date(2024, 10, 30)
  let appointmentCounter = 1
  let transactionCounter = 1

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 0) continue

    const appointmentsPerDay = dayOfWeek === 6 ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 4

    for (let i = 0; i < appointmentsPerDay; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const pet = customer.pets[Math.floor(Math.random() * customer.pets.length)]
      const staffMember = staff[Math.floor(Math.random() * staff.length)]
      
      const hour = 9 + Math.floor(Math.random() * 7)
      const minute = [0, 30][Math.floor(Math.random() * 2)]
      
      const appointmentDate = new Date(date)
      appointmentDate.setHours(hour, minute, 0, 0)

      const numServices = Math.floor(Math.random() * 3) + 1
      const selectedServices: any[] = []
      const availableServices = [...services]
      
      for (let j = 0; j < numServices && availableServices.length > 0; j++) {
        const serviceIndex = Math.floor(Math.random() * availableServices.length)
        selectedServices.push(availableServices[serviceIndex])
        availableServices.splice(serviceIndex, 1)
      }

      const totalPrice = selectedServices.reduce((sum, svc) => sum + svc.price, 0)
      const totalDuration = selectedServices.reduce((sum, svc) => sum + svc.duration, 0)

      const isPast = appointmentDate < new Date()
      const status = isPast 
        ? (Math.random() > 0.1 ? 'completed' : 'cancelled')
        : (Math.random() > 0.95 ? 'cancelled' : 'scheduled')

      const appointment = {
        id: `apt-${String(appointmentCounter).padStart(3, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed,
        staffId: staffMember.id,
        staffName: staffMember.name,
        date: appointmentDate.toISOString(),
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price })),
        totalPrice,
        duration: totalDuration,
        status,
        notes: status === 'cancelled' ? 'Customer requested cancellation' : (Math.random() > 0.7 ? 'Standard appointment' : ''),
        createdAt: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      appointments.push(appointment)
      appointmentCounter++

      if (status === 'completed') {
        const tipAmount = Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 5 : 0
        const paymentMethod = ['cash', 'credit_card', 'debit_card'][Math.floor(Math.random() * 3)]
        
        const transaction = {
          id: `txn-${String(transactionCounter).padStart(3, '0')}`,
          appointmentId: appointment.id,
          customerId: customer.id,
          customerName: customer.name,
          petName: pet.name,
          date: appointmentDate.toISOString(),
          items: selectedServices.map(s => ({
            id: s.id,
            name: s.name,
            quantity: 1,
            price: s.price,
            total: s.price
          })),
          subtotal: totalPrice,
          tip: tipAmount,
          tax: Math.round(totalPrice * 0.08 * 100) / 100,
          total: totalPrice + tipAmount + Math.round(totalPrice * 0.08 * 100) / 100,
          paymentMethod,
          staffId: staffMember.id,
          staffName: staffMember.name,
          notes: tipAmount > 0 ? `Tip: $${tipAmount}` : ''
        }

        transactions.push(transaction)
        transactionCounter++
      }
    }
  }

  appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const inventory = [
    {
      id: 'inv-001',
      name: 'Premium Dog Shampoo',
      category: 'Shampoo',
      quantity: 45,
      unit: 'bottles',
      reorderPoint: 20,
      price: 24.99,
      supplier: 'PetCare Supplies Inc',
      lastRestocked: '2024-10-15'
    },
    {
      id: 'inv-002',
      name: 'Hypoallergenic Conditioner',
      category: 'Conditioner',
      quantity: 32,
      unit: 'bottles',
      reorderPoint: 15,
      price: 28.99,
      supplier: 'PetCare Supplies Inc',
      lastRestocked: '2024-10-20'
    },
    {
      id: 'inv-003',
      name: 'Grooming Scissors Set',
      category: 'Tools',
      quantity: 8,
      unit: 'sets',
      reorderPoint: 5,
      price: 89.99,
      supplier: 'Professional Grooming Tools',
      lastRestocked: '2024-09-30'
    },
    {
      id: 'inv-004',
      name: 'Nail Clippers - Large',
      category: 'Tools',
      quantity: 12,
      unit: 'pieces',
      reorderPoint: 6,
      price: 15.99,
      supplier: 'Professional Grooming Tools',
      lastRestocked: '2024-10-10'
    },
    {
      id: 'inv-005',
      name: 'Nail Clippers - Small',
      category: 'Tools',
      quantity: 15,
      unit: 'pieces',
      reorderPoint: 8,
      price: 12.99,
      supplier: 'Professional Grooming Tools',
      lastRestocked: '2024-10-10'
    },
    {
      id: 'inv-006',
      name: 'Grooming Table Mat',
      category: 'Equipment',
      quantity: 5,
      unit: 'pieces',
      reorderPoint: 3,
      price: 45.00,
      supplier: 'Professional Grooming Tools',
      lastRestocked: '2024-10-01'
    },
    {
      id: 'inv-007',
      name: 'Flea & Tick Shampoo',
      category: 'Shampoo',
      quantity: 18,
      unit: 'bottles',
      reorderPoint: 12,
      price: 32.99,
      supplier: 'PetCare Supplies Inc',
      lastRestocked: '2024-10-25'
    },
    {
      id: 'inv-008',
      name: 'De-shedding Tool',
      category: 'Tools',
      quantity: 10,
      unit: 'pieces',
      reorderPoint: 5,
      price: 34.99,
      supplier: 'Professional Grooming Tools',
      lastRestocked: '2024-10-18'
    },
    {
      id: 'inv-009',
      name: 'Towels - Large',
      category: 'Supplies',
      quantity: 50,
      unit: 'pieces',
      reorderPoint: 25,
      price: 8.99,
      supplier: 'General Supplies Co',
      lastRestocked: '2024-11-01'
    },
    {
      id: 'inv-010',
      name: 'Ear Cleaning Solution',
      category: 'Supplies',
      quantity: 22,
      unit: 'bottles',
      reorderPoint: 10,
      price: 18.99,
      supplier: 'PetCare Supplies Inc',
      lastRestocked: '2024-10-28'
    }
  ]

  return {
    customers,
    staff,
    services,
    appointments,
    transactions,
    inventory
  }
}
