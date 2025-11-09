import { useState, useEffect } from 'react'
import { useKV } from '@/lib/useKV'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CreditCard, 
  Check,
  Phone,
  Dog,
  Package,
  Plus,
  Minus,
  Trash,
  ShoppingBag,
  CaretLeft,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Appointment {
  id: string
  petName: string
  petId?: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  serviceId: string
  staffId?: string
  date: string
  time: string
  endTime?: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminderSent?: boolean
  confirmationSent?: boolean
  pickupNotificationSent?: boolean
  pickupNotificationAcknowledged?: boolean
  checkInTime?: string
  checkOutTime?: string
  paymentCompleted?: boolean
  paymentMethod?: 'cash' | 'card' | 'cashapp' | 'chime'
  amountPaid?: number
  pickedUpTime?: string
  createdAt: string
  rating?: number
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Transaction {
  id: string
  appointmentId: string
  customerId: string
  customerName: string
  petName: string
  staffName?: string
  service: string
  date: string
  time: string
  subtotal: number
  tax: number
  tip: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
  status: 'completed' | 'pending' | 'refunded'
  timestamp: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
  category: string
  description?: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
}

interface LineItem {
  id: string
  type: 'service' | 'product'
  itemId: string
  name: string
  price: number
  quantity: number
  originalAppointmentService?: boolean
}

interface AppointmentCheckoutProps {
  appointment: Appointment
  onBack: () => void
  onComplete: () => void
}

export function AppointmentCheckout({ 
  appointment, 
  onComplete,
  onBack
}: AppointmentCheckoutProps) {
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [services] = useKV<Service[]>('services', [])
  const [products] = useKV<Product[]>('inventory', [])
  
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'cashapp' | 'chime'>('card')
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [applyTax, setApplyTax] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddItems, setShowAddItems] = useState(false)

  const TAX_RATE = 0.0825

  const customer = customers?.find(c => c.id === appointment.customerId)
  const staffMember = appointment.staffId 
    ? staffMembers?.find(s => s.id === appointment.staffId)
    : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const appointmentServiceItem: LineItem = {
      id: `appointment-service-${appointment.id}`,
      type: 'service',
      itemId: appointment.serviceId,
      name: appointment.service,
      price: appointment.price,
      quantity: 1,
      originalAppointmentService: true
    }
    setLineItems([appointmentServiceItem])
    setShowAddItems(false)
    setTipAmount(0)
    setDiscountPercent(0)
    setPaymentMethod('card')
    setApplyTax(true)
  }, [appointment])

  if (!customer) return null

  const addService = (service: Service) => {
    const existingItem = lineItems.find(
      (item) => item.type === 'service' && item.itemId === service.id && !item.originalAppointmentService
    )

    if (existingItem) {
      setLineItems((current) =>
        current.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      const newItem: LineItem = {
        id: `line-${Date.now()}-${Math.random()}`,
        type: 'service',
        itemId: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
      }
      setLineItems((current) => [...current, newItem])
    }
    toast.success(`Added ${service.name}`)
  }

  const addProduct = (product: Product) => {
    const existingItem = lineItems.find(
      (item) => item.type === 'product' && item.itemId === product.id
    )

    if (existingItem) {
      const newQty = existingItem.quantity + 1
      if (newQty > product.stock) {
        toast.error(`Only ${product.stock} in stock`)
        return
      }
      setLineItems((current) =>
        current.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: newQty } : item
        )
      )
    } else {
      if (product.stock < 1) {
        toast.error('Out of stock')
        return
      }
      const newItem: LineItem = {
        id: `line-${Date.now()}-${Math.random()}`,
        type: 'product',
        itemId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }
      setLineItems((current) => [...current, newItem])
    }
    toast.success(`Added ${product.name}`)
  }

  const updateQuantity = (lineId: string, delta: number) => {
    setLineItems((current) =>
      current
        .map((item) => {
          if (item.id === lineId) {
            if (item.originalAppointmentService) {
              toast.error("Can't modify the original appointment service")
              return item
            }
            
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            
            if (item.type === 'product') {
              const product = (products || []).find((p) => p.id === item.itemId)
              if (product && newQty > product.stock) {
                toast.error(`Only ${product.stock} in stock`)
                return item
              }
            }
            
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item): item is LineItem => item !== null)
    )
  }

  const removeItem = (lineId: string) => {
    const item = lineItems.find(i => i.id === lineId)
    if (item?.originalAppointmentService) {
      toast.error("Can't remove the original appointment service")
      return
    }
    setLineItems((current) => current.filter((item) => item.id !== lineId))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * discountPercent) / 100
  }

  const calculateTax = () => {
    if (!applyTax) return 0
    return (calculateSubtotal() - calculateDiscount()) * TAX_RATE
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax() + tipAmount
  }

  const handleProcessPayment = () => {
    setIsProcessing(true)

    setTimeout(() => {
      const now = new Date()
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        appointmentId: appointment.id,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        petName: appointment.petName,
        staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : undefined,
        service: appointment.service,
        date: now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        timestamp: now.toISOString(),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        tip: tipAmount,
        discount: calculateDiscount(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
      }

      setTransactions((current) => [transaction, ...(current || [])])

      setAppointments((current) =>
        (current || []).map(apt => {
          if (apt.id === appointment.id) {
            return {
              ...apt,
              status: 'completed' as const,
              paymentCompleted: true,
              paymentMethod: paymentMethod,
              amountPaid: calculateTotal(),
              pickedUpTime: new Date().toISOString(),
              checkOutTime: new Date().toISOString()
            }
          }
          return apt
        })
      )

      toast.success(
        <div className="flex items-center space-x-2">
          <Check size={20} className="text-green-500" weight="bold" />
          <span>Payment processed & appointment completed!</span>
        </div>
      )

      setLineItems([])
      setTipAmount(0)
      setDiscountPercent(0)
      setShowAddItems(false)
      setIsProcessing(false)
      onComplete()
    }, 1500)
  }

  const availableServices = (services || []).filter(s => s.id !== appointment.serviceId)
  const availableProducts = products || []

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="glass-card rounded-[1.25rem] overflow-hidden p-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-2"
        >
          <CaretLeft size={18} className="mr-2" />
          Back to Appointment
        </Button>
      </div>

      <div className="glass-card rounded-[1.25rem] overflow-hidden p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <CreditCard size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white/90">Checkout</h1>
              <p className="text-base text-white/60 mt-1">
                {showAddItems ? 'Add services & products' : 'Complete payment and mark as picked up'}
              </p>
            </div>
          </div>

          <Separator />

          {!showAddItems ? (
            <>
              <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Dog size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.petName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {customer.firstName} {customer.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-muted-foreground" />
                        <span>{appointment.service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-white/90">Items</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddItems(true)}
                      className="h-8"
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add Items
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {lineItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{item.name}</p>
                              {item.originalAppointmentService && (
                                <Badge variant="secondary" className="text-xs">Service</Badge>
                              )}
                              {item.type === 'product' && (
                                <Badge variant="outline" className="text-xs">Product</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {!item.originalAppointmentService && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus size={12} />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus size={12} />
                                </Button>
                              </div>
                            )}
                            <p className="font-bold text-sm min-w-[60px] text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {!item.originalAppointmentService && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(item.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash size={14} className="text-destructive" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-white/90">Payment Details</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="discount-percent" className="text-xs">
                        Discount %
                      </Label>
                      <Input
                        id="discount-percent"
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) =>
                          setDiscountPercent(
                            Math.max(0, Math.min(100, Number(e.target.value)))
                          )
                        }
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tip-amount" className="text-xs">
                        Tip Amount $
                      </Label>
                      <Input
                        id="tip-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tipAmount}
                        onChange={(e) =>
                          setTipAmount(Math.max(0, Number(e.target.value)))
                        }
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply-tax"
                      checked={applyTax}
                      onCheckedChange={(checked) => setApplyTax(checked === true)}
                    />
                    <Label htmlFor="apply-tax" className="text-sm cursor-pointer">
                      Apply sales tax (8.25%)
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="payment-method" className="text-xs">
                      Payment Method
                    </Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cashapp">Cash App</SelectItem>
                        <SelectItem value="chime">Chime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Subtotal:</span>
                      <span className="font-medium text-white/90">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({discountPercent}%):</span>
                        <span>-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    {applyTax && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Tax (8.25%):</span>
                        <span className="font-medium text-white/90">${calculateTax().toFixed(2)}</span>
                      </div>
                    )}
                    {tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Tip:</span>
                        <span className="font-medium text-white/90">${tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white/90">Total:</span>
                      <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CreditCard size={18} className="mr-2" />
                        Complete Checkout & Mark Picked Up
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white/90">Add Services & Products</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddItems(false)}
                >
                  Done
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkle size={16} className="text-accent" weight="fill" />
                    <h4 className="font-semibold text-sm text-white/90">Available Services</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No additional services available
                      </p>
                    ) : (
                      availableServices.map((service) => (
                        <motion.button
                          key={service.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => addService(service)}
                          className="w-full text-left bg-card rounded-lg p-3 hover:bg-primary/5 transition-colors border border-border"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{service.name}</p>
                              <p className="text-xs text-muted-foreground">{service.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">${service.price.toFixed(2)}</Badge>
                              <Plus size={16} className="text-primary" />
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={16} className="text-green-500" weight="fill" />
                    <h4 className="font-semibold text-sm text-white/90">Retail Products</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No products available
                      </p>
                    ) : (
                      availableProducts.map((product) => (
                        <motion.button
                          key={product.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => addProduct(product)}
                          disabled={product.stock === 0}
                          className="w-full text-left bg-card rounded-lg p-3 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Stock: {product.stock} • {product.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">${product.price.toFixed(2)}</Badge>
                              <Plus size={16} className="text-primary" />
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}