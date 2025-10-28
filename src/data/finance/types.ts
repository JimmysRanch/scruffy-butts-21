// Finance Module Type Definitions
// TODO: These interfaces will be used with backend API responses

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  date: string
  dueDate: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Expense {
  id: string
  date: string
  category: string
  vendor: string
  description: string
  amount: number
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
  status: 'pending' | 'paid'
  receiptUrl?: string
}

export interface Payout {
  id: string
  date: string
  expectedDate: string
  amount: number
  fees: number
  net: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentMethod: string
}

export interface ProcessorFee {
  id: string
  date: string
  transactionId: string
  amount: number
  feeAmount: number
  feePercentage: number
}

export interface PayrollPeriod {
  id: string
  periodStart: string
  periodEnd: string
  payDate: string
  status: 'draft' | 'processing' | 'paid'
  employees: PayrollEmployee[]
  totalGross: number
  totalTips: number
  totalNet: number
}

export interface PayrollEmployee {
  id: string
  name: string
  hours: number
  hourlyRate: number
  gross: number
  tips: number
  commissions: number
  deductions: number
  net: number
}

export interface Vendor {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  paymentTerms: string
  status: 'active' | 'inactive'
  totalPurchases: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendorId: string
  vendorName: string
  orderDate: string
  expectedDate: string
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
}

export interface PurchaseOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}
