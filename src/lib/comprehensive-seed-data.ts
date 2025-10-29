// Comprehensive mock data seeding script for Scruffy Butts
// Covers October 15 - November 15, 2025

import { format, addDays, addHours, startOfDay, setHours, setMinutes, parse } from 'date-fns'

// Base date: October 15, 2025
const BASE_DATE = new Date(2025, 9, 15) // Month is 0-indexed, so 9 = October

// Helper function to generate random time slots
const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
]

const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min

// Staff Members (at least 3)
export const mockStaffMembers = [
  {
    id: 'staff-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@scruffybutts.com',
    phone: '(555) 123-4567',
    position: 'Lead Groomer',
    hireDate: '2023-01-15',
    address: '123 Main Street',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    specialties: ['Full Groom', 'Show Cuts', 'Hand Stripping', 'Creative Grooming'],
    notes: 'Specializes in large breeds and show cuts. 15 years of experience.',
    status: 'active' as const,
    rating: 5,
    canBeBooked: true,
    bookableServices: ['service-001', 'service-002', 'service-003', 'service-004', 'service-006'],
    commissionEnabled: true,
    commissionPercent: 40,
    hourlyPayEnabled: true,
    hourlyRate: 28,
    salaryEnabled: false,
    salaryAmount: 0,
    weeklyGuaranteeEnabled: false,
    weeklyGuarantee: 0,
    guaranteePayoutMethod: 'higher' as const,
    teamOverridesEnabled: false,
    teamOverrides: [],
    color: '#6366f1'
  },
  {
    id: 'staff-002',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@scruffybutts.com',
    phone: '(555) 234-5678',
    position: 'Senior Groomer',
    hireDate: '2023-06-01',
    address: '456 Oak Avenue',
    city: 'Portland',
    state: 'OR',
    zip: '97202',
    specialties: ['Bath & Brush', 'Nail Trim', 'De-shedding', 'Teeth Brushing'],
    notes: 'Excellent with nervous dogs. Great customer service skills.',
    status: 'active' as const,
    rating: 4.8,
    canBeBooked: true,
    bookableServices: ['service-001', 'service-002', 'service-003', 'service-004', 'service-005'],
    commissionEnabled: true,
    commissionPercent: 35,
    hourlyPayEnabled: true,
    hourlyRate: 25,
    salaryEnabled: false,
    salaryAmount: 0,
    weeklyGuaranteeEnabled: false,
    weeklyGuarantee: 0,
    guaranteePayoutMethod: 'higher' as const,
    teamOverridesEnabled: false,
    teamOverrides: [],
    color: '#8b5cf6'
  },
  {
    id: 'staff-003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@scruffybutts.com',
    phone: '(555) 345-6789',
    position: 'Groomer',
    hireDate: '2024-03-10',
    address: '789 Elm Street',
    city: 'Portland',
    state: 'OR',
    zip: '97203',
    specialties: ['Full Groom', 'Puppy Cuts', 'Teeth Brushing', 'Ear Cleaning'],
    notes: 'Wonderful with small breeds and puppies. Very gentle approach.',
    status: 'active' as const,
    rating: 4.9,
    canBeBooked: true,
    bookableServices: ['service-001', 'service-002', 'service-003', 'service-005'],
    commissionEnabled: true,
    commissionPercent: 30,
    hourlyPayEnabled: true,
    hourlyRate: 22,
    salaryEnabled: false,
    salaryAmount: 0,
    weeklyGuaranteeEnabled: false,
    weeklyGuarantee: 0,
    guaranteePayoutMethod: 'higher' as const,
    teamOverridesEnabled: false,
    teamOverrides: [],
    color: '#ec4899'
  },
  {
    id: 'staff-004',
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.thompson@scruffybutts.com',
    phone: '(555) 456-7890',
    position: 'Bather',
    hireDate: '2024-08-15',
    address: '321 Pine Road',
    city: 'Portland',
    state: 'OR',
    zip: '97204',
    specialties: ['Bath & Brush', 'Nail Trim', 'Basic Grooming'],
    notes: 'New team member with great potential. Learning advanced techniques.',
    status: 'active' as const,
    rating: 4.5,
    canBeBooked: true,
    bookableServices: ['service-002', 'service-003'],
    commissionEnabled: true,
    commissionPercent: 25,
    hourlyPayEnabled: true,
    hourlyRate: 18,
    salaryEnabled: false,
    salaryAmount: 0,
    weeklyGuaranteeEnabled: false,
    weeklyGuarantee: 0,
    guaranteePayoutMethod: 'higher' as const,
    teamOverridesEnabled: false,
    teamOverrides: [],
    color: '#f59e0b'
  }
]

// Services
export const mockServices = [
  {
    id: 'service-001',
    name: 'Full Groom',
    description: 'Complete grooming service including bath, brush, haircut, nail trim, and ear cleaning',
    duration: 120,
    price: 85,
    category: 'Grooming',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-002',
    name: 'Bath & Brush',
    description: 'Basic bath with professional shampoo and thorough brushing',
    duration: 60,
    price: 45,
    category: 'Bathing',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-003',
    name: 'Nail Trim',
    description: 'Professional nail trimming and filing',
    duration: 15,
    price: 15,
    category: 'Maintenance',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-004',
    name: 'De-shedding Treatment',
    description: 'Special treatment to reduce shedding with premium products',
    duration: 45,
    price: 35,
    category: 'Specialty',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-005',
    name: 'Teeth Brushing',
    description: 'Professional dental cleaning and breath freshening',
    duration: 15,
    price: 20,
    category: 'Maintenance',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-006',
    name: 'Show Cut',
    description: 'Premium breed-specific grooming for shows and competitions',
    duration: 180,
    price: 150,
    category: 'Premium',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-007',
    name: 'Puppy First Groom',
    description: 'Gentle introduction to grooming for puppies',
    duration: 90,
    price: 55,
    category: 'Grooming',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'service-008',
    name: 'Ear Cleaning',
    description: 'Thorough ear cleaning and inspection',
    duration: 10,
    price: 12,
    category: 'Maintenance',
    createdAt: new Date(2023, 0, 1).toISOString()
  }
]

// Customers with Pets
export const mockCustomers = [
  {
    id: 'customer-001',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@email.com',
    phone: '(555) 111-2222',
    address: '1010 Maple Drive',
    city: 'Portland',
    state: 'OR',
    zip: '97205',
    notes: 'Prefers early morning appointments',
    createdAt: new Date(2024, 0, 15).toISOString(),
    pets: [
      {
        id: 'pet-001',
        name: 'Bella',
        breed: 'Poodle',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'medium' as const,
        age: 4,
        gender: 'Female' as const,
        notes: 'Very friendly, loves treats'
      }
    ]
  },
  {
    id: 'customer-002',
    firstName: 'Robert',
    lastName: 'Thompson',
    email: 'robert.thompson@email.com',
    phone: '(555) 222-3333',
    address: '2020 Cedar Lane',
    city: 'Portland',
    state: 'OR',
    zip: '97206',
    notes: 'Regular customer, monthly appointments',
    createdAt: new Date(2024, 1, 10).toISOString(),
    pets: [
      {
        id: 'pet-002',
        name: 'Duke',
        breed: 'German Shepherd',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 3,
        gender: 'Male' as const,
        notes: 'Needs firm handling, can be nervous'
      }
    ]
  },
  {
    id: 'customer-003',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@email.com',
    phone: '(555) 333-4444',
    address: '3030 Birch Street',
    city: 'Portland',
    state: 'OR',
    zip: '97207',
    createdAt: new Date(2024, 2, 5).toISOString(),
    pets: [
      {
        id: 'pet-003',
        name: 'Max',
        breed: 'Golden Retriever',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 6,
        gender: 'Male' as const,
        notes: 'Very calm and well-behaved'
      },
      {
        id: 'pet-004',
        name: 'Luna',
        breed: 'Beagle',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'medium' as const,
        age: 2,
        gender: 'Female' as const,
        notes: 'Energetic, loves to play'
      }
    ]
  },
  {
    id: 'customer-004',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 444-5555',
    address: '4040 Spruce Avenue',
    city: 'Portland',
    state: 'OR',
    zip: '97208',
    createdAt: new Date(2024, 3, 20).toISOString(),
    pets: [
      {
        id: 'pet-005',
        name: 'Charlie',
        breed: 'Labrador Retriever',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 5,
        gender: 'Male' as const,
        notes: 'Loves water, very playful'
      }
    ]
  },
  {
    id: 'customer-005',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '(555) 555-6666',
    address: '5050 Willow Court',
    city: 'Portland',
    state: 'OR',
    zip: '97209',
    createdAt: new Date(2024, 4, 12).toISOString(),
    pets: [
      {
        id: 'pet-006',
        name: 'Daisy',
        breed: 'Yorkshire Terrier',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'small' as const,
        age: 3,
        gender: 'Female' as const,
        notes: 'Show dog, requires special cuts'
      }
    ]
  },
  {
    id: 'customer-006',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@email.com',
    phone: '(555) 666-7777',
    address: '6060 Aspen Drive',
    city: 'Portland',
    state: 'OR',
    zip: '97210',
    createdAt: new Date(2024, 5, 8).toISOString(),
    pets: [
      {
        id: 'pet-007',
        name: 'Rocky',
        breed: 'Bulldog',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'medium' as const,
        age: 4,
        gender: 'Male' as const,
        notes: 'Skin folds need special attention'
      }
    ]
  },
  {
    id: 'customer-007',
    firstName: 'Patricia',
    lastName: 'Davis',
    email: 'patricia.davis@email.com',
    phone: '(555) 777-8888',
    address: '7070 Poplar Lane',
    city: 'Portland',
    state: 'OR',
    zip: '97211',
    createdAt: new Date(2024, 6, 15).toISOString(),
    pets: [
      {
        id: 'pet-008',
        name: 'Molly',
        breed: 'Shih Tzu',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'small' as const,
        age: 7,
        gender: 'Female' as const,
        notes: 'Senior dog, very gentle'
      }
    ]
  },
  {
    id: 'customer-008',
    firstName: 'Michael',
    lastName: 'Miller',
    email: 'michael.miller@email.com',
    phone: '(555) 888-9999',
    address: '8080 Redwood Street',
    city: 'Portland',
    state: 'OR',
    zip: '97212',
    createdAt: new Date(2024, 7, 22).toISOString(),
    pets: [
      {
        id: 'pet-009',
        name: 'Buddy',
        breed: 'Cocker Spaniel',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'medium' as const,
        age: 5,
        gender: 'Male' as const,
        notes: 'Regular ear cleaning needed'
      }
    ]
  },
  {
    id: 'customer-009',
    firstName: 'Jessica',
    lastName: 'Taylor',
    email: 'jessica.taylor@email.com',
    phone: '(555) 999-0000',
    address: '9090 Fir Avenue',
    city: 'Portland',
    state: 'OR',
    zip: '97213',
    createdAt: new Date(2024, 8, 5).toISOString(),
    pets: [
      {
        id: 'pet-010',
        name: 'Sophie',
        breed: 'French Bulldog',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'medium' as const,
        age: 2,
        gender: 'Female' as const,
        notes: 'Very affectionate'
      }
    ]
  },
  {
    id: 'customer-010',
    firstName: 'Christopher',
    lastName: 'Moore',
    email: 'christopher.moore@email.com',
    phone: '(555) 000-1111',
    address: '1111 Hemlock Road',
    city: 'Portland',
    state: 'OR',
    zip: '97214',
    createdAt: new Date(2024, 9, 1).toISOString(),
    pets: [
      {
        id: 'pet-011',
        name: 'Zeus',
        breed: 'Rottweiler',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'giant' as const,
        age: 4,
        gender: 'Male' as const,
        notes: 'Large dog, requires experienced groomer'
      }
    ]
  },
  {
    id: 'customer-011',
    firstName: 'Amanda',
    lastName: 'Jackson',
    email: 'amanda.jackson@email.com',
    phone: '(555) 111-0000',
    address: '1212 Cypress Court',
    city: 'Portland',
    state: 'OR',
    zip: '97215',
    createdAt: new Date(2025, 0, 10).toISOString(),
    pets: [
      {
        id: 'pet-012',
        name: 'Sadie',
        breed: 'Border Collie',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 3,
        gender: 'Female' as const,
        notes: 'High energy, needs quick service'
      }
    ]
  },
  {
    id: 'customer-012',
    firstName: 'Daniel',
    lastName: 'White',
    email: 'daniel.white@email.com',
    phone: '(555) 222-1111',
    address: '1313 Magnolia Lane',
    city: 'Portland',
    state: 'OR',
    zip: '97216',
    createdAt: new Date(2025, 1, 5).toISOString(),
    pets: [
      {
        id: 'pet-013',
        name: 'Bailey',
        breed: 'Australian Shepherd',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 6,
        gender: 'Male' as const,
        notes: 'Thick coat, needs de-shedding'
      }
    ]
  },
  {
    id: 'customer-013',
    firstName: 'Sarah',
    lastName: 'Harris',
    email: 'sarah.harris@email.com',
    phone: '(555) 333-2222',
    address: '1414 Chestnut Street',
    city: 'Portland',
    state: 'OR',
    zip: '97217',
    createdAt: new Date(2025, 2, 15).toISOString(),
    pets: [
      {
        id: 'pet-014',
        name: 'Coco',
        breed: 'Maltese',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'small' as const,
        age: 4,
        gender: 'Female' as const,
        notes: 'Likes to be pampered'
      }
    ]
  },
  {
    id: 'customer-014',
    firstName: 'Kevin',
    lastName: 'Martin',
    email: 'kevin.martin@email.com',
    phone: '(555) 444-3333',
    address: '1515 Hickory Avenue',
    city: 'Portland',
    state: 'OR',
    zip: '97218',
    createdAt: new Date(2025, 3, 8).toISOString(),
    pets: [
      {
        id: 'pet-015',
        name: 'Tucker',
        breed: 'Boxer',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'large' as const,
        age: 3,
        gender: 'Male' as const,
        notes: 'Very energetic, loves attention'
      }
    ]
  },
  {
    id: 'customer-015',
    firstName: 'Nancy',
    lastName: 'Lee',
    email: 'nancy.lee@email.com',
    phone: '(555) 555-4444',
    address: '1616 Sycamore Drive',
    city: 'Portland',
    state: 'OR',
    zip: '97219',
    createdAt: new Date(2025, 4, 20).toISOString(),
    pets: [
      {
        id: 'pet-016',
        name: 'Oliver',
        breed: 'Cavalier King Charles Spaniel',
        customBreed: '',
        isMixedBreed: false,
        weightClass: 'small' as const,
        age: 5,
        gender: 'Male' as const,
        notes: 'Very sweet temperament'
      }
    ]
  }
]

// Generate appointments from Oct 15 - Nov 15, 2025
export function generateMockAppointments() {
  const appointments = []
  const statuses = ['completed', 'scheduled', 'confirmed', 'checked-in', 'in-progress', 'ready-for-pickup', 'cancelled', 'no-show'] as const
  const appointmentId = (index: number) => `apt-${String(index).padStart(4, '0')}`
  
  let appointmentCounter = 1

  // Generate appointments for each day in the range
  for (let day = 0; day <= 31; day++) {
    const currentDate = addDays(BASE_DATE, day)
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    
    // Skip some Sundays (closed)
    if (currentDate.getDay() === 0) continue
    
    // Fewer appointments on Saturdays
    const appointmentsPerDay = isWeekend ? randomInt(3, 6) : randomInt(6, 12)
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const customer = randomChoice(mockCustomers)
      const pet = randomChoice(customer.pets)
      const service = randomChoice(mockServices)
      const staff = randomChoice(mockStaffMembers)
      const time = randomChoice(TIME_SLOTS)
      
      // Determine status based on date
      let status: typeof statuses[number]
      const isPast = currentDate < new Date()
      if (isPast) {
        // Past appointments are mostly completed, some no-shows or cancelled
        const rand = Math.random()
        if (rand < 0.85) status = 'completed'
        else if (rand < 0.92) status = 'no-show'
        else status = 'cancelled'
      } else {
        // Future appointments
        const rand = Math.random()
        if (rand < 0.6) status = 'scheduled'
        else if (rand < 0.9) status = 'confirmed'
        else status = 'checked-in'
      }
      
      appointments.push({
        id: appointmentId(appointmentCounter++),
        petName: pet.name,
        petId: pet.id,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerId: customer.id,
        service: service.name,
        serviceId: service.id,
        staffId: staff.id,
        groomerRequested: Math.random() < 0.3,
        date: dateStr,
        time,
        endTime: '', // Will be calculated
        duration: service.duration,
        price: service.price,
        status,
        notes: Math.random() < 0.3 ? 'Customer requested extra attention to coat' : '',
        reminderSent: status !== 'scheduled',
        confirmationSent: status !== 'scheduled',
        createdAt: addDays(currentDate, -randomInt(1, 7)).toISOString()
      })
    }
  }
  
  return appointments
}

// Generate POS transactions
export function generateMockTransactions() {
  const transactions = []
  const paymentMethods = ['cash', 'card', 'cashapp', 'chime'] as const
  let transactionCounter = 1
  
  // Generate transactions from Oct 15 - Nov 15
  for (let day = 0; day <= 31; day++) {
    const currentDate = addDays(BASE_DATE, day)
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const isPast = currentDate < new Date()
    
    // Only generate for past dates
    if (!isPast) continue
    
    // 2-5 transactions per day
    const transactionsPerDay = randomInt(2, 5)
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const customer = randomChoice(mockCustomers)
      const pet = randomChoice(customer.pets)
      const staff = randomChoice(mockStaffMembers)
      const service = randomChoice(mockServices)
      const paymentMethod = randomChoice(paymentMethods)
      
      // Sometimes add multiple items
      const itemCount = randomInt(1, 3)
      const items = []
      let subtotal = 0
      
      for (let j = 0; j < itemCount; j++) {
        const itemService = randomChoice(mockServices)
        const quantity = 1
        items.push({
          service: itemService,
          quantity
        })
        subtotal += itemService.price * quantity
      }
      
      const tax = subtotal * 0.08
      const total = subtotal + tax
      
      transactions.push({
        id: `txn-${String(transactionCounter++).padStart(4, '0')}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        petName: pet.name,
        staffName: `${staff.firstName} ${staff.lastName}`,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        timestamp: addHours(currentDate, randomInt(9, 18)).toISOString(),
        date: dateStr,
        time: randomChoice(TIME_SLOTS)
      })
    }
  }
  
  return transactions
}

// Inventory items
export const mockInventoryItems = [
  {
    id: 'inv-001',
    name: 'Premium Dog Shampoo',
    category: 'shampoo' as const,
    sku: 'SHP-001',
    quantity: 24,
    unit: 'bottle',
    reorderLevel: 8,
    reorderQuantity: 20,
    costPerUnit: 12.50,
    sellingPrice: 24.99,
    supplier: 'Pet Pro Supplies',
    location: 'Storage Room A, Shelf 1',
    notes: 'Popular item, sells well',
    lastRestocked: format(addDays(BASE_DATE, -10), 'yyyy-MM-dd')
  },
  {
    id: 'inv-002',
    name: 'Hypoallergenic Conditioner',
    category: 'conditioner' as const,
    sku: 'CND-001',
    quantity: 18,
    unit: 'bottle',
    reorderLevel: 6,
    reorderQuantity: 15,
    costPerUnit: 14.00,
    sellingPrice: 27.99,
    supplier: 'Pet Pro Supplies',
    location: 'Storage Room A, Shelf 1',
    notes: 'For sensitive skin'
  },
  {
    id: 'inv-003',
    name: 'Professional Grooming Scissors',
    category: 'tools' as const,
    sku: 'TLS-001',
    quantity: 8,
    unit: 'piece',
    reorderLevel: 3,
    reorderQuantity: 5,
    costPerUnit: 35.00,
    sellingPrice: 79.99,
    supplier: 'Groomer\'s Choice',
    location: 'Tool Cabinet',
    notes: 'High quality, professional grade'
  },
  {
    id: 'inv-004',
    name: 'Nail Clippers (Large)',
    category: 'tools' as const,
    sku: 'TLS-002',
    quantity: 12,
    unit: 'piece',
    reorderLevel: 4,
    reorderQuantity: 10,
    costPerUnit: 8.50,
    sellingPrice: 18.99,
    supplier: 'Groomer\'s Choice',
    location: 'Tool Cabinet',
    notes: 'For large breeds'
  },
  {
    id: 'inv-005',
    name: 'Nail Clippers (Small)',
    category: 'tools' as const,
    sku: 'TLS-003',
    quantity: 10,
    unit: 'piece',
    reorderLevel: 4,
    reorderQuantity: 10,
    costPerUnit: 6.50,
    sellingPrice: 14.99,
    supplier: 'Groomer\'s Choice',
    location: 'Tool Cabinet',
    notes: 'For small breeds'
  },
  {
    id: 'inv-006',
    name: 'Dog Treats - Premium',
    category: 'treats' as const,
    sku: 'TRT-001',
    quantity: 45,
    unit: 'bag',
    reorderLevel: 15,
    reorderQuantity: 30,
    costPerUnit: 4.50,
    sellingPrice: 9.99,
    supplier: 'Healthy Paws Co.',
    location: 'Storage Room B, Shelf 2',
    notes: 'Grain-free, natural ingredients'
  },
  {
    id: 'inv-007',
    name: 'Ear Cleaning Solution',
    category: 'other' as const,
    sku: 'EAR-001',
    quantity: 22,
    unit: 'bottle',
    reorderLevel: 8,
    reorderQuantity: 15,
    costPerUnit: 7.00,
    sellingPrice: 15.99,
    supplier: 'Pet Pro Supplies',
    location: 'Storage Room A, Shelf 2',
    notes: 'Veterinary approved'
  },
  {
    id: 'inv-008',
    name: 'De-shedding Tool',
    category: 'tools' as const,
    sku: 'TLS-004',
    quantity: 6,
    unit: 'piece',
    reorderLevel: 2,
    reorderQuantity: 5,
    costPerUnit: 18.00,
    sellingPrice: 39.99,
    supplier: 'Groomer\'s Choice',
    location: 'Tool Cabinet',
    notes: 'For heavy shedders'
  },
  {
    id: 'inv-009',
    name: 'Flea & Tick Shampoo',
    category: 'shampoo' as const,
    sku: 'SHP-002',
    quantity: 15,
    unit: 'bottle',
    reorderLevel: 5,
    reorderQuantity: 12,
    costPerUnit: 16.00,
    sellingPrice: 32.99,
    supplier: 'Pet Pro Supplies',
    location: 'Storage Room A, Shelf 1',
    notes: 'Natural formula, effective'
  },
  {
    id: 'inv-010',
    name: 'Grooming Towels (Pack of 12)',
    category: 'accessories' as const,
    sku: 'ACC-001',
    quantity: 8,
    unit: 'pack',
    reorderLevel: 3,
    reorderQuantity: 6,
    costPerUnit: 22.00,
    sellingPrice: 44.99,
    supplier: 'Salon Essentials',
    location: 'Linen Closet',
    notes: 'Microfiber, quick-dry'
  },
  {
    id: 'inv-011',
    name: 'Dental Care Kit',
    category: 'accessories' as const,
    sku: 'ACC-002',
    quantity: 12,
    unit: 'kit',
    reorderLevel: 4,
    reorderQuantity: 10,
    costPerUnit: 15.00,
    sellingPrice: 34.99,
    supplier: 'Healthy Paws Co.',
    location: 'Storage Room B, Shelf 1',
    notes: 'Includes toothbrush and paste'
  },
  {
    id: 'inv-012',
    name: 'Whitening Shampoo',
    category: 'shampoo' as const,
    sku: 'SHP-003',
    quantity: 10,
    unit: 'bottle',
    reorderLevel: 4,
    reorderQuantity: 10,
    costPerUnit: 18.00,
    sellingPrice: 36.99,
    supplier: 'Pet Pro Supplies',
    location: 'Storage Room A, Shelf 1',
    notes: 'For white/light coats'
  }
]

// Inventory suppliers
export const mockSuppliers = [
  {
    id: 'sup-001',
    name: 'Pet Pro Supplies',
    contact: 'John Smith',
    email: 'orders@petprosupplies.com',
    phone: '(555) 100-2000',
    notes: 'Main supplier for shampoos and conditioners. 10% discount on bulk orders.'
  },
  {
    id: 'sup-002',
    name: 'Groomer\'s Choice',
    contact: 'Mary Johnson',
    email: 'sales@groomerschoice.com',
    phone: '(555) 200-3000',
    notes: 'Premium tools and equipment. Fast shipping.'
  },
  {
    id: 'sup-003',
    name: 'Healthy Paws Co.',
    contact: 'Tom Anderson',
    email: 'support@healthypaws.com',
    phone: '(555) 300-4000',
    notes: 'Treats and dental products. Organic options available.'
  },
  {
    id: 'sup-004',
    name: 'Salon Essentials',
    contact: 'Lisa Davis',
    email: 'info@salonessentials.com',
    phone: '(555) 400-5000',
    notes: 'Towels, aprons, and grooming accessories.'
  }
]

// Inventory transactions
export function generateMockInventoryTransactions() {
  const transactions = []
  let transactionCounter = 1
  
  // Generate some usage and restock transactions
  mockInventoryItems.forEach(item => {
    // Restock transaction
    transactions.push({
      id: `inv-txn-${String(transactionCounter++).padStart(4, '0')}`,
      itemId: item.id,
      itemName: item.name,
      type: 'restock' as const,
      quantity: item.reorderQuantity,
      previousQuantity: item.quantity - item.reorderQuantity,
      newQuantity: item.quantity,
      date: format(addDays(BASE_DATE, -10), 'yyyy-MM-dd'),
      notes: 'Regular restock',
      performedBy: 'Sarah Johnson'
    })
    
    // Usage transactions
    const usageCount = randomInt(2, 5)
    for (let i = 0; i < usageCount; i++) {
      const usageQty = randomInt(1, 3)
      transactions.push({
        id: `inv-txn-${String(transactionCounter++).padStart(4, '0')}`,
        itemId: item.id,
        itemName: item.name,
        type: 'usage' as const,
        quantity: usageQty,
        previousQuantity: item.quantity + usageQty,
        newQuantity: item.quantity,
        date: format(addDays(BASE_DATE, -randomInt(1, 9)), 'yyyy-MM-dd'),
        notes: 'Used in grooming service',
        performedBy: randomChoice(['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez']).toString()
      })
    }
  })
  
  return transactions
}

// Staff schedules
export function generateMockSchedules() {
  const shifts = []
  const timeOffRequests = []
  let shiftCounter = 1
  let timeOffCounter = 1
  
  // Generate regular shifts for each staff member
  mockStaffMembers.forEach(staff => {
    for (let day = 0; day <= 31; day++) {
      const currentDate = addDays(BASE_DATE, day)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const dayOfWeek = currentDate.getDay()
      
      // Skip Sundays (closed)
      if (dayOfWeek === 0) continue
      
      // Staff member works most days except their day off
      const isDayOff = (staff.id === 'staff-001' && dayOfWeek === 3) || // Sarah has Wednesdays off
                       (staff.id === 'staff-002' && dayOfWeek === 4) || // Mike has Thursdays off
                       (staff.id === 'staff-003' && dayOfWeek === 2)    // Emily has Tuesdays off
      
      if (isDayOff) continue
      
      // Regular shift
      shifts.push({
        id: `shift-${String(shiftCounter++).padStart(4, '0')}`,
        staffId: staff.id,
        date: dateStr,
        startTime: '9:00 AM',
        endTime: dayOfWeek === 6 ? '3:00 PM' : '5:00 PM', // Shorter on Saturdays
        type: 'regular' as const,
        status: 'scheduled' as const,
        createdAt: addDays(currentDate, -7).toISOString()
      })
      
      // Lunch break
      shifts.push({
        id: `shift-${String(shiftCounter++).padStart(4, '0')}`,
        staffId: staff.id,
        date: dateStr,
        startTime: '12:00 PM',
        endTime: '1:00 PM',
        type: 'break' as const,
        status: 'scheduled' as const,
        createdAt: addDays(currentDate, -7).toISOString()
      })
    }
  })
  
  // Add a few time-off requests
  timeOffRequests.push({
    id: `timeoff-${String(timeOffCounter++).padStart(3, '0')}`,
    staffId: 'staff-002',
    startDate: format(addDays(BASE_DATE, 20), 'yyyy-MM-dd'),
    endDate: format(addDays(BASE_DATE, 22), 'yyyy-MM-dd'),
    type: 'vacation' as const,
    reason: 'Family trip',
    status: 'approved' as const,
    createdAt: addDays(BASE_DATE, -5).toISOString(),
    approvedBy: 'Sarah Johnson',
    approvedAt: addDays(BASE_DATE, -4).toISOString()
  })
  
  timeOffRequests.push({
    id: `timeoff-${String(timeOffCounter++).padStart(3, '0')}`,
    staffId: 'staff-003',
    startDate: format(addDays(BASE_DATE, 28), 'yyyy-MM-dd'),
    endDate: format(addDays(BASE_DATE, 28), 'yyyy-MM-dd'),
    type: 'personal' as const,
    reason: 'Personal appointment',
    status: 'pending' as const,
    createdAt: addDays(BASE_DATE, 15).toISOString()
  })
  
  return { shifts, timeOffRequests }
}

// Main seeding function
export async function seedComprehensiveMockData() {
  try {
    console.log('Starting comprehensive data seeding...')
    
    // Check if window.spark is available - with retry logic
    let retries = 0
    const maxRetries = 5
    while (retries < maxRetries) {
      if (typeof window !== 'undefined' && window.spark && window.spark.kv) {
        break
      }
      console.log(`Waiting for Spark KV to be available... (attempt ${retries + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    if (typeof window === 'undefined' || !window.spark || !window.spark.kv) {
      console.error('❌ window.spark.kv is not available after waiting')
      throw new Error('Spark KV storage is not available. Please ensure the app is running in a Spark environment.')
    }
    
    // Seed staff members
    await window.spark.kv.set('staff-members', mockStaffMembers)
    console.log(`✓ Seeded ${mockStaffMembers.length} staff members`)
    
    // Seed services
    await window.spark.kv.set('services', mockServices)
    console.log(`✓ Seeded ${mockServices.length} services`)
    
    // Seed customers
    await window.spark.kv.set('customers', mockCustomers)
    console.log(`✓ Seeded ${mockCustomers.length} customers with ${mockCustomers.reduce((sum, c) => sum + c.pets.length, 0)} pets`)
    
    // Seed appointments
    const appointments = generateMockAppointments()
    await window.spark.kv.set('appointments', appointments)
    console.log(`✓ Seeded ${appointments.length} appointments`)
    
    // Seed transactions
    const transactions = generateMockTransactions()
    await window.spark.kv.set('transactions', transactions)
    console.log(`✓ Seeded ${transactions.length} POS transactions`)
    
    // Seed inventory
    await window.spark.kv.set('inventory-items', mockInventoryItems)
    console.log(`✓ Seeded ${mockInventoryItems.length} inventory items`)
    
    await window.spark.kv.set('inventory-suppliers', mockSuppliers)
    console.log(`✓ Seeded ${mockSuppliers.length} suppliers`)
    
    const inventoryTransactions = generateMockInventoryTransactions()
    await window.spark.kv.set('inventory-transactions', inventoryTransactions)
    console.log(`✓ Seeded ${inventoryTransactions.length} inventory transactions`)
    
    // Seed schedules
    const { shifts, timeOffRequests } = generateMockSchedules()
    await window.spark.kv.set('staff-schedules', shifts)
    await window.spark.kv.set('time-off-requests', timeOffRequests)
    console.log(`✓ Seeded ${shifts.length} staff shifts and ${timeOffRequests.length} time-off requests`)
    
    console.log('✅ All mock data seeded successfully!')
    console.log(`Data range: October 15, 2025 - November 15, 2025`)
    
    return true
  } catch (error) {
    console.error('Error seeding mock data:', error)
    throw error
  }
}
