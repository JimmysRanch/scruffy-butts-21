import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CreditCard, 
  Plus, 
  Minus, 
  Trash, 
  Check,
  Money,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
}

interface Transaction {
  id: string
  customerId: string
  customerName: string
  date: string
  items: LineItem[]
  subtotal: number
  tax: number
  tip: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'other'
  status: 'completed' | 'pending' | 'refunded'
}

interface QuickCheckoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
}

export function QuickCheckout({ open, onOpenChange, customerId, customerName }: QuickCheckoutProps) {
  const [services] = useKV<Service[]>('services', [])
  const [products] = useKV<Product[]>('inventory', [])
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'other'>('card')
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [applyTax, setApplyTax] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const TAX_RATE = 0.0825

  const addService = (service: Service) => {
    const existingItem = lineItems.find(
      (item) => item.type === 'service' && item.itemId === service.id
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
  }

  const updateQuantity = (lineId: string, delta: number) => {
    setLineItems((current) =>
      current
        .map((item) => {
          if (item.id === lineId) {
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
    if (lineItems.length === 0) {
      toast.error('Add items to checkout')
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      const now = new Date()
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        customerId,
        customerName,
        date: now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: lineItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        tip: tipAmount,
        discount: calculateDiscount(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
      }

      setTransactions((current) => [transaction, ...(current || [])])

      lineItems.forEach((item) => {
        if (item.type === 'product') {
          const product = (products || []).find((p) => p.id === item.itemId)
          if (product) {
          }
        }
      })

      toast.success(
        <div className="flex items-center space-x-2">
          <Check size={20} className="text-green-500" weight="bold" />
          <span>Payment processed successfully!</span>
        </div>
      )

      setLineItems([])
      setTipAmount(0)
      setDiscountPercent(0)
      setIsProcessing(false)
      onOpenChange(false)
    }, 1500)
  }

  const availableServices = services || []
  const availableProducts = products || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard size={24} className="text-primary" />
            <span>Quick Checkout - {customerName}</span>
          </DialogTitle>
          <DialogDescription>
            Add services and products, then process payment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center space-x-2">
                  <Sparkle size={16} className="text-accent" weight="fill" />
                  <span>Available Services</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No services available
                    </p>
                  ) : (
                    availableServices.map((service) => (
                      <motion.button
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addService(service)}
                        className="w-full text-left glass-dark rounded-lg p-3 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.category}</p>
                          </div>
                          <Badge variant="secondary">${service.price.toFixed(2)}</Badge>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center space-x-2">
                  <Money size={16} className="text-green-500" weight="fill" />
                  <span>Products</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No products available
                    </p>
                  ) : (
                    availableProducts.map((product) => (
                      <motion.button
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addProduct(product)}
                        disabled={product.stock === 0}
                        className="w-full text-left glass-dark rounded-lg p-3 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </p>
                          </div>
                          <Badge variant="secondary">${product.price.toFixed(2)}</Badge>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="frosted rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">Cart Items</h3>
                
                {lineItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {lineItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass-dark rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} each
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash size={14} className="text-destructive" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="h-7 w-7 p-0"
                              >
                                <Minus size={12} />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Plus size={12} />
                              </Button>
                            </div>
                            <p className="font-bold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-3">
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
                        className="h-9"
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
                        className="h-9"
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
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {applyTax && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (8.25%):</span>
                      <span className="font-medium">${calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tip:</span>
                      <span className="font-medium">${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProcessPayment}
                  disabled={lineItems.length === 0 || isProcessing}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
