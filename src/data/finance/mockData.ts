import type { Invoice, Expense, Payout, ProcessorFee, PayrollPeriod, Vendor, PurchaseOrder } from './types'

// TODO: Replace with actual API calls to backend

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2025-001',
    customerId: 'CUST-001',
    customerName: 'Sarah Johnson',
    date: '2025-10-15',
    dueDate: '2025-11-14',
    amount: 125.00,
    status: 'sent',
    items: [
      {
        id: 'ITEM-001',
        description: 'Full Grooming Service - Buddy (Golden Retriever)',
        quantity: 1,
        unitPrice: 85.00,
        total: 85.00
      },
      {
        id: 'ITEM-002',
        description: 'Nail Trim',
        quantity: 1,
        unitPrice: 20.00,
        total: 20.00
      },
      {
        id: 'ITEM-003',
        description: 'Teeth Cleaning',
        quantity: 1,
        unitPrice: 20.00,
        total: 20.00
      }
    ]
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2025-002',
    customerId: 'CUST-002',
    customerName: 'Mike Chen',
    date: '2025-10-20',
    dueDate: '2025-10-27',
    amount: 95.00,
    status: 'overdue',
    items: [
      {
        id: 'ITEM-004',
        description: 'Full Grooming Service - Max (Poodle)',
        quantity: 1,
        unitPrice: 75.00,
        total: 75.00
      },
      {
        id: 'ITEM-005',
        description: 'Ear Cleaning',
        quantity: 1,
        unitPrice: 20.00,
        total: 20.00
      }
    ]
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2025-003',
    customerId: 'CUST-003',
    customerName: 'Emily Rodriguez',
    date: '2025-10-22',
    dueDate: '2025-11-21',
    amount: 65.00,
    status: 'paid',
    items: [
      {
        id: 'ITEM-006',
        description: 'Bath & Brush - Luna (Yorkie)',
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00
      },
      {
        id: 'ITEM-007',
        description: 'Nail Trim',
        quantity: 1,
        unitPrice: 20.00,
        total: 20.00
      }
    ]
  }
]

export const mockExpenses: Expense[] = [
  {
    id: 'EXP-001',
    date: '2025-10-25',
    category: 'Supplies',
    vendor: 'Pet Supply Co.',
    description: 'Shampoo and conditioner bulk order',
    amount: 245.50,
    paymentMethod: 'card',
    status: 'paid'
  },
  {
    id: 'EXP-002',
    date: '2025-10-20',
    category: 'Utilities',
    vendor: 'City Power & Light',
    description: 'October electricity bill',
    amount: 180.00,
    paymentMethod: 'transfer',
    status: 'paid'
  },
  {
    id: 'EXP-003',
    date: '2025-10-15',
    category: 'Rent',
    vendor: 'Property Management LLC',
    description: 'November rent payment',
    amount: 2500.00,
    paymentMethod: 'check',
    status: 'paid'
  },
  {
    id: 'EXP-004',
    date: '2025-10-28',
    category: 'Equipment',
    vendor: 'Grooming Equipment Depot',
    description: 'Replacement grooming table',
    amount: 450.00,
    paymentMethod: 'card',
    status: 'pending'
  },
  {
    id: 'EXP-005',
    date: '2025-10-26',
    category: 'Marketing',
    vendor: 'Local Print Shop',
    description: 'Business cards and flyers',
    amount: 125.00,
    paymentMethod: 'cash',
    status: 'paid'
  }
]

export const mockPayouts: Payout[] = [
  {
    id: 'PAY-001',
    date: '2025-10-20',
    expectedDate: '2025-10-21',
    amount: 1250.00,
    fees: 37.50,
    net: 1212.50,
    status: 'completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'PAY-002',
    date: '2025-10-15',
    expectedDate: '2025-10-16',
    amount: 980.00,
    fees: 29.40,
    net: 950.60,
    status: 'completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'PAY-003',
    date: '2025-10-30',
    expectedDate: '2025-10-31',
    amount: 1420.00,
    fees: 42.60,
    net: 1377.40,
    status: 'pending',
    paymentMethod: 'Bank Transfer'
  }
]

export const mockProcessorFees: ProcessorFee[] = [
  {
    id: 'FEE-001',
    date: '2025-10-25',
    transactionId: 'TXN-12345',
    amount: 85.00,
    feeAmount: 2.55,
    feePercentage: 3.0
  },
  {
    id: 'FEE-002',
    date: '2025-10-24',
    transactionId: 'TXN-12344',
    amount: 120.00,
    feeAmount: 3.60,
    feePercentage: 3.0
  },
  {
    id: 'FEE-003',
    date: '2025-10-23',
    transactionId: 'TXN-12343',
    amount: 65.00,
    feeAmount: 1.95,
    feePercentage: 3.0
  }
]

export const mockPayrollPeriods: PayrollPeriod[] = [
  {
    id: 'PR-001',
    periodStart: '2025-10-16',
    periodEnd: '2025-10-31',
    payDate: '2025-11-05',
    status: 'draft',
    totalGross: 2400.00,
    totalTips: 420.00,
    totalNet: 2520.00,
    employees: [
      {
        id: 'EMP-001',
        name: 'Alex Thompson',
        hours: 80,
        hourlyRate: 18.00,
        gross: 1440.00,
        tips: 250.00,
        commissions: 0,
        deductions: 140.00,
        net: 1550.00
      },
      {
        id: 'EMP-002',
        name: 'Jordan Lee',
        hours: 60,
        hourlyRate: 16.00,
        gross: 960.00,
        tips: 170.00,
        commissions: 0,
        deductions: 160.00,
        net: 970.00
      }
    ]
  },
  {
    id: 'PR-002',
    periodStart: '2025-10-01',
    periodEnd: '2025-10-15',
    payDate: '2025-10-20',
    status: 'paid',
    totalGross: 2400.00,
    totalTips: 380.00,
    totalNet: 2480.00,
    employees: [
      {
        id: 'EMP-001',
        name: 'Alex Thompson',
        hours: 80,
        hourlyRate: 18.00,
        gross: 1440.00,
        tips: 220.00,
        commissions: 0,
        deductions: 140.00,
        net: 1520.00
      },
      {
        id: 'EMP-002',
        name: 'Jordan Lee',
        hours: 60,
        hourlyRate: 16.00,
        gross: 960.00,
        tips: 160.00,
        commissions: 0,
        deductions: 160.00,
        net: 960.00
      }
    ]
  }
]

export const mockVendors: Vendor[] = [
  {
    id: 'VEN-001',
    name: 'Pet Supply Co.',
    contactName: 'Robert Williams',
    email: 'robert@petsupplyco.com',
    phone: '(555) 123-4567',
    paymentTerms: 'Net 30',
    status: 'active',
    totalPurchases: 3245.50
  },
  {
    id: 'VEN-002',
    name: 'Grooming Equipment Depot',
    contactName: 'Lisa Garcia',
    email: 'lisa@groomingdepot.com',
    phone: '(555) 234-5678',
    paymentTerms: 'Net 15',
    status: 'active',
    totalPurchases: 1850.00
  },
  {
    id: 'VEN-003',
    name: 'Professional Pet Products',
    contactName: 'David Martinez',
    email: 'david@propetproducts.com',
    phone: '(555) 345-6789',
    paymentTerms: 'Due on Receipt',
    status: 'active',
    totalPurchases: 920.00
  },
  {
    id: 'VEN-004',
    name: 'Wholesale Grooming Supplies',
    contactName: 'Amanda Johnson',
    email: 'amanda@wholesalegrooming.com',
    phone: '(555) 456-7890',
    paymentTerms: 'Net 30',
    status: 'inactive',
    totalPurchases: 450.00
  }
]

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNumber: 'PO-2025-001',
    vendorId: 'VEN-001',
    vendorName: 'Pet Supply Co.',
    orderDate: '2025-10-22',
    expectedDate: '2025-10-29',
    status: 'sent',
    subtotal: 425.00,
    tax: 34.00,
    total: 459.00,
    items: [
      {
        id: 'POITEM-001',
        productName: 'Premium Dog Shampoo (Gallon)',
        quantity: 5,
        unitPrice: 45.00,
        total: 225.00
      },
      {
        id: 'POITEM-002',
        productName: 'Conditioner (Gallon)',
        quantity: 4,
        unitPrice: 50.00,
        total: 200.00
      }
    ]
  },
  {
    id: 'PO-002',
    poNumber: 'PO-2025-002',
    vendorId: 'VEN-002',
    vendorName: 'Grooming Equipment Depot',
    orderDate: '2025-10-15',
    expectedDate: '2025-10-22',
    status: 'received',
    subtotal: 450.00,
    tax: 36.00,
    total: 486.00,
    items: [
      {
        id: 'POITEM-003',
        productName: 'Professional Grooming Table',
        quantity: 1,
        unitPrice: 450.00,
        total: 450.00
      }
    ]
  },
  {
    id: 'PO-003',
    poNumber: 'PO-2025-003',
    vendorId: 'VEN-003',
    vendorName: 'Professional Pet Products',
    orderDate: '2025-10-25',
    expectedDate: '2025-11-01',
    status: 'draft',
    subtotal: 180.00,
    tax: 14.40,
    total: 194.40,
    items: [
      {
        id: 'POITEM-004',
        productName: 'Grooming Scissors Set',
        quantity: 2,
        unitPrice: 60.00,
        total: 120.00
      },
      {
        id: 'POITEM-005',
        productName: 'Clipper Blades (Pack of 5)',
        quantity: 2,
        unitPrice: 30.00,
        total: 60.00
      }
    ]
  }
]
