import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransactionReceipt } from '@/components/TransactionReceipt'
import { Plus, Minus, ShoppingCart, CreditCard, Money, Receipt, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface CartItem {
  service: Service
  quantity: number
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
  name?: string
}

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
}

interface Transaction {
  id: string
  customerId?: string
  customerName?: string
  petName?: string
  staffName?: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card'
  timestamp: string
  date?: string
  time?: string
}

export function PointOfSale() {
  const [services] = useKV<Service[]>('services', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('walk-in')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)

  const isCompact = appearance?.compactMode || false

  const servicesList = services || []
  const customersList = customers || []
  const transactionsList = transactions || []
  
  const TAX_RATE = 0.08 // 8% tax rate

  const addToCart = (service: Service) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.service.id === service.id)
      if (existingItem) {
        return prev.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { service, quantity: 1 }]
    })
  }

  const removeFromCart = (serviceId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.service.id === serviceId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.service.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter(item => item.service.id !== serviceId)
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const processPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    const now = new Date()
    const customer = selectedCustomer !== 'walk-in' 
      ? customersList.find(c => c.id === selectedCustomer)
      : null

    const transaction: Transaction = {
      id: Date.now().toString(),
      customerId: selectedCustomer === 'walk-in' ? undefined : selectedCustomer,
      customerName: customer 
        ? `${customer.firstName} ${customer.lastName}`
        : 'Walk-in Customer',
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }

    setTransactions(currentTransactions => [transaction, ...(currentTransactions || [])])
    setCart([])
    setSelectedCustomer('walk-in')
    toast.success(`Payment of $${total.toFixed(2)} processed successfully!`)
  }

  const openReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setReceiptDialogOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-foreground text-xl">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Services */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart size={18} />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {servicesList.map(service => (
                  <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-medium text-sm">{service.name}</h3>
                        <Badge variant="secondary" className="text-xs">${service.price}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {service.duration} minutes
                      </p>
                      <Button 
                        onClick={() => addToCart(service)}
                        size="sm" 
                        className="w-full h-7 text-xs"
                      >
                        <Plus size={14} className="mr-1" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {servicesList.length === 0 && (
                  <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                    No services available. Add services in the Services tab.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-base">Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {/* Customer Selection */}
              <div>
                <label className="text-xs font-medium mb-1.5 block">Customer (Optional)</label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customersList.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName && customer.lastName 
                          ? `${customer.firstName} ${customer.lastName}` 
                          : customer.name || 'Unknown Customer'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cart Items */}
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.service.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{item.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.service.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.service.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-6 text-center text-xs">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(item.service)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-3 text-sm">
                    Cart is empty
                  </p>
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <Separator />
                  
                  {/* Totals */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Money size={16} />
                            Cash
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button onClick={processPayment} className="w-full" size="lg">
                      Process Payment
                    </Button>
                    <Button onClick={clearCart} variant="outline" className="w-full">
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsList.length > 0 ? (
            <div className="space-y-4">
              {transactionsList.slice(0, 5).map(transaction => {
                const customer = customersList.find(c => c.id === transaction.customerId)
                const customerName = transaction.customerName || 
                  (customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in Customer')
                const total = transaction?.total ?? 0
                const items = transaction?.items ?? []
                const itemCount = items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0)
                const paymentMethod = transaction?.paymentMethod ?? 'card'
                
                const displayDate = transaction.date || 
                  (transaction.timestamp 
                    ? new Date(transaction.timestamp).toLocaleDateString()
                    : 'Date unavailable')
                const displayTime = transaction.time || 
                  (transaction.timestamp 
                    ? new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '')
                
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-start justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openReceipt(transaction)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt size={16} className="text-primary" />
                        <p className="font-medium">{customerName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {displayDate}{displayTime && ` at ${displayTime}`}
                      </p>
                      {transaction.petName && (
                        <p className="text-sm text-muted-foreground">
                          Pet: {transaction.petName}
                        </p>
                      )}
                      {transaction.staffName && (
                        <p className="text-sm text-muted-foreground">
                          Groomer: {transaction.staffName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} • {paymentMethod}
                      </p>
                      {items.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              • {item?.service?.name || 'Unknown Item'} × {item?.quantity || 0}
                            </p>
                          ))}
                          {items.length > 2 && (
                            <p className="text-xs text-muted-foreground italic">
                              + {items.length - 2} more item{items.length - 2 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg">${total.toFixed(2)}</p>
                      <Badge variant={paymentMethod === 'cash' ? 'secondary' : 'default'} className="mt-1">
                        {paymentMethod}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <TransactionReceipt
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}