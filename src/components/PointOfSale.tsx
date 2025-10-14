import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus, ShoppingCart, CreditCard, Money } from '@phosphor-icons/react'
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
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card'
  timestamp: Date
}

export function PointOfSale() {
  const [services] = useKV<Service[]>('services', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('walk-in')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')

  // Ensure we have arrays even if undefined
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

    const transaction: Transaction = {
      id: Date.now().toString(),
      customerId: selectedCustomer === 'walk-in' ? undefined : selectedCustomer,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      timestamp: new Date()
    }

    setTransactions(prev => [transaction, ...(prev || [])])
    setCart([])
    setSelectedCustomer('walk-in')
    toast.success(`Payment of $${total.toFixed(2)} processed successfully!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesList.map(service => (
                  <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{service.name}</h3>
                        <Badge variant="secondary">${service.price}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.duration} minutes
                      </p>
                      <Button 
                        onClick={() => addToCart(service)}
                        size="sm" 
                        className="w-full"
                      >
                        <Plus size={16} className="mr-1" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {servicesList.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
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
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Customer (Optional)</label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
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
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.service.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.service.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.service.id)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(item.service)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Cart is empty
                  </p>
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <Separator />
                  
                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
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
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()} at{' '}
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.items.length} item(s) • {transaction.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${transaction.total.toFixed(2)}</p>
                      <Badge variant={transaction.paymentMethod === 'cash' ? 'secondary' : 'default'}>
                        {transaction.paymentMethod}
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
    </div>
  )
}