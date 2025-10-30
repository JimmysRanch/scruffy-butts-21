# Finance Frontend Data Mapping Documentation

This document describes the data requirements for each UI element in the Finance module. This serves as a specification for backend API development.

**Note:** All data shown in the UI is currently mock data. Backend integration points are marked with `TODO` comments in the code.

---

## 1. INVOICES MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Total Invoices | number | Count of all invoices | Read-only |
| Outstanding Amount | currency | Sum of sent + overdue invoice amounts | Read-only |
| Overdue Invoices | number | Count of invoices with status='overdue' | Read-only |

#### Invoices Table
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Invoice Number | string | Invoice.invoiceNumber | Read-only |
| Customer Name | string | Invoice.customerName | Read-only |
| Date | date | Invoice.date | Read-only |
| Due Date | date | Invoice.dueDate | Read-only |
| Amount | currency | Invoice.amount | Read-only |
| Status | enum | Invoice.status (draft/sent/paid/overdue/cancelled) | Read-only |

#### Actions
| Action | Description | Backend Operation |
|--------|-------------|-------------------|
| Create Invoice | Opens modal to create new invoice | POST /api/invoices |
| View Invoice | Shows invoice details | GET /api/invoices/{id} |
| Download Invoice | Generates PDF | GET /api/invoices/{id}/pdf |

### Data Structure
```typescript
interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  date: string  // ISO 8601
  dueDate: string  // ISO 8601
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}
```

---

## 2. EXPENSES MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Total Expenses | currency | Sum of all expense amounts | Read-only |
| Paid | currency | Sum of expenses with status='paid' | Read-only |
| Pending | currency | Sum of expenses with status='pending' | Read-only |

#### Category Breakdown
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Category Name | string | Expense.category | Read-only |
| Category Total | currency | Sum of amounts for category | Read-only |

#### Expenses Table
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Date | date | Expense.date | Read-only |
| Category | string | Expense.category | Read-only |
| Vendor | string | Expense.vendor | Read-only |
| Description | string | Expense.description | Read-only |
| Amount | currency | Expense.amount | Read-only |
| Payment Method | enum | Expense.paymentMethod (cash/card/check/transfer) | Read-only |
| Status | enum | Expense.status (pending/paid) | Read-only |

#### Actions
| Action | Description | Backend Operation |
|--------|-------------|-------------------|
| Add Expense | Opens modal to add new expense | POST /api/expenses |

### Data Structure
```typescript
interface Expense {
  id: string
  date: string  // ISO 8601
  category: string
  vendor: string
  description: string
  amount: number
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
  status: 'pending' | 'paid'
  receiptUrl?: string
}
```

---

## 3. PAYMENTS MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Next Payout Amount | currency | Payout.net (first pending payout) | Read-only |
| Next Payout Date | date | Payout.expectedDate (first pending) | Read-only |
| Processor Fees MTD | currency | Sum of ProcessorFee.feeAmount for current month | Read-only |
| Transaction Count | number | Count of processor fees | Read-only |

#### Upcoming Payout Card
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Gross Amount | currency | Payout.amount | Read-only |
| Processing Fees | currency | Payout.fees | Read-only |
| Net Payout | currency | Payout.net | Read-only |
| Status | enum | Payout.status (pending/processing/completed/failed) | Read-only |
| Payment Method | string | Payout.paymentMethod | Read-only |

#### Fee Breakdown Chart
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Fee Category | string | Calculated from fee types | Read-only |
| Fee Amount | currency | Sum for category | Read-only |

#### Recent Fees List
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Date | date | ProcessorFee.date | Read-only |
| Transaction Amount | currency | ProcessorFee.amount | Read-only |
| Fee Amount | currency | ProcessorFee.feeAmount | Read-only |
| Fee Percentage | number | ProcessorFee.feePercentage | Read-only |

#### Payout History Table
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Date | date | Payout.date | Read-only |
| Expected Date | date | Payout.expectedDate | Read-only |
| Gross | currency | Payout.amount | Read-only |
| Fees | currency | Payout.fees | Read-only |
| Net | currency | Payout.net | Read-only |
| Status | enum | Payout.status | Read-only |
| Method | string | Payout.paymentMethod | Read-only |

### Data Structures
```typescript
interface Payout {
  id: string
  date: string  // ISO 8601
  expectedDate: string  // ISO 8601
  amount: number
  fees: number
  net: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentMethod: string
}

interface ProcessorFee {
  id: string
  date: string  // ISO 8601
  transactionId: string
  amount: number
  feeAmount: number
  feePercentage: number
}
```

---

## 4. PAYROLL MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Next Payroll Date | date | PayrollPeriod.payDate (first draft) | Read-only |
| Period Range | string | PayrollPeriod.periodStart - periodEnd | Read-only |
| Total Gross + Tips | currency | PayrollPeriod.totalGross + totalTips | Read-only |
| Net Payout | currency | PayrollPeriod.totalNet | Read-only |
| Employee Count | number | Count of PayrollPeriod.employees | Read-only |

#### Next Pay Period Table
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Employee Name | string | PayrollEmployee.name | Read-only |
| Hours | number | PayrollEmployee.hours | Read-only |
| Rate | currency | PayrollEmployee.hourlyRate | Read-only |
| Gross | currency | PayrollEmployee.gross | Read-only |
| Tips | currency | PayrollEmployee.tips | Read-only |
| Commissions | currency | PayrollEmployee.commissions | Read-only |
| Deductions | currency | PayrollEmployee.deductions | Read-only |
| Net Pay | currency | PayrollEmployee.net | Read-only |

#### Payroll History
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Period Range | string | PayrollPeriod start-end dates | Read-only |
| Pay Date | date | PayrollPeriod.payDate | Read-only |
| Employee Count | number | Count of employees | Read-only |
| Total Gross | currency | PayrollPeriod.totalGross | Read-only |
| Total Tips | currency | PayrollPeriod.totalTips | Read-only |
| Total Net | currency | PayrollPeriod.totalNet | Read-only |
| Status | enum | PayrollPeriod.status (draft/processing/paid) | Read-only |

#### Actions
| Action | Description | Backend Operation |
|--------|-------------|-------------------|
| Export Summaries | Downloads payroll reports | GET /api/payroll/export |

### Data Structures
```typescript
interface PayrollPeriod {
  id: string
  periodStart: string  // ISO 8601
  periodEnd: string  // ISO 8601
  payDate: string  // ISO 8601
  status: 'draft' | 'processing' | 'paid'
  employees: PayrollEmployee[]
  totalGross: number
  totalTips: number
  totalNet: number
}

interface PayrollEmployee {
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
```

---

## 5. VENDORS MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Total Vendors | number | Count of all vendors | Read-only |
| Active Vendors | number | Count where status='active' | Read-only |
| Total Purchases | currency | Sum of Vendor.totalPurchases | Read-only |

#### Vendor Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Vendor Name | string | Vendor.name | Read-only |
| Contact Name | string | Vendor.contactName | Read-only |
| Email | email | Vendor.email | Read-only |
| Phone | phone | Vendor.phone | Read-only |
| Payment Terms | string | Vendor.paymentTerms | Read-only |
| Total Purchases | currency | Vendor.totalPurchases | Read-only |
| Status | enum | Vendor.status (active/inactive) | Read-only |

#### Vendors Table
Same fields as Vendor Cards, displayed in table format.

#### Actions
| Action | Description | Backend Operation |
|--------|-------------|-------------------|
| Add Vendor | Opens modal to add vendor | POST /api/vendors |
| Email Vendor | Opens email client | mailto link |
| Call Vendor | Initiates phone call | tel link |

### Data Structure
```typescript
interface Vendor {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  paymentTerms: string
  status: 'active' | 'inactive'
  totalPurchases: number
}
```

---

## 6. PURCHASE ORDERS MODULE

### UI Elements and Data Requirements

#### Summary Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Total Purchase Orders | number | Count of all POs | Read-only |
| Outstanding Orders | number | Count where status='sent' | Read-only |
| Total Value | currency | Sum of PurchaseOrder.total | Read-only |

#### Purchase Order Cards
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| PO Number | string | PurchaseOrder.poNumber | Read-only |
| Vendor Name | string | PurchaseOrder.vendorName | Read-only |
| Order Date | date | PurchaseOrder.orderDate | Read-only |
| Expected Date | date | PurchaseOrder.expectedDate | Read-only |
| Subtotal | currency | PurchaseOrder.subtotal | Read-only |
| Tax | currency | PurchaseOrder.tax | Read-only |
| Total | currency | PurchaseOrder.total | Read-only |
| Status | enum | PurchaseOrder.status (draft/sent/received/cancelled) | Read-only |
| Item Count | number | Count of items | Read-only |

#### PO Items
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| Product Name | string | PurchaseOrderItem.productName | Read-only |
| Quantity | number | PurchaseOrderItem.quantity | Read-only |
| Unit Price | currency | PurchaseOrderItem.unitPrice | Read-only |
| Total | currency | PurchaseOrderItem.total | Read-only |

#### Purchase Orders Table
| Field | Data Type | Source | Read/Write |
|-------|-----------|--------|------------|
| PO Number | string | PurchaseOrder.poNumber | Read-only |
| Vendor | string | PurchaseOrder.vendorName | Read-only |
| Order Date | date | PurchaseOrder.orderDate | Read-only |
| Expected | date | PurchaseOrder.expectedDate | Read-only |
| Items | number | Count of items | Read-only |
| Total | currency | PurchaseOrder.total | Read-only |
| Status | enum | PurchaseOrder.status | Read-only |

#### Actions
| Action | Description | Backend Operation |
|--------|-------------|-------------------|
| Create PO | Opens modal to create PO | POST /api/purchase-orders |
| View Details | Shows full PO details | GET /api/purchase-orders/{id} |

### Data Structures
```typescript
interface PurchaseOrder {
  id: string
  poNumber: string
  vendorId: string
  vendorName: string
  orderDate: string  // ISO 8601
  expectedDate: string  // ISO 8601
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
}

interface PurchaseOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}
```

---

## BACKEND INTEGRATION CHECKLIST

### Required API Endpoints

#### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/{id}` - Get invoice details
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/{id}/pdf` - Download invoice PDF

#### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense

#### Payments
- `GET /api/payouts` - List all payouts
- `GET /api/processor-fees` - List processor fees
- `GET /api/payments/export` - Export payment data

#### Payroll
- `GET /api/payroll` - List payroll periods
- `GET /api/payroll/{id}` - Get payroll period details
- `GET /api/payroll/export` - Export payroll summaries

#### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/{id}` - Update vendor
- `DELETE /api/vendors/{id}` - Delete vendor

#### Purchase Orders
- `GET /api/purchase-orders` - List all purchase orders
- `GET /api/purchase-orders/{id}` - Get PO details
- `POST /api/purchase-orders` - Create new PO
- `PUT /api/purchase-orders/{id}` - Update PO status

### Current Implementation Notes

1. **All modules display mock data** from `/src/data/finance/mockData.ts`
2. **TODO comments** mark where API calls should replace mock data
3. **Read-only constraint**: Payments and Payroll modules are intentionally read-only as backend logic will be added later
4. **No backend dependencies**: UI works independently without any backend service
5. **Type safety**: All data structures defined in `/src/data/finance/types.ts`

### Testing Notes

All finance pages should:
- Load without errors
- Display realistic mock data
- Show proper loading states (currently instant with mock data)
- Handle navigation between tabs
- Render responsively on desktop and tablet

No functionality requires backend integration at this time. All create/edit/delete operations trigger UI actions but do not persist data.
