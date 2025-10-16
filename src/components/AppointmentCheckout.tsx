import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Money,
  Check,
  Bell,
  BellRinging,
  Phone,
  Dog,
  Package,
  User
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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

interface AppointmentCheckoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  customer: Customer | null
  staffMember?: StaffMember | null
  onComplete: (appointmentId: string, paymentData: {
    paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
    amountPaid: number
    tip: number
    discount: number
  }) => void
}

export function AppointmentCheckout({ 
  open, 
  onOpenChange, 
  appointment, 
  customer,
  staffMember,
  onComplete 
}: AppointmentCheckoutProps) {
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'cashapp' | 'chime'>('card')
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [applyTax, setApplyTax] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  const TAX_RATE = 0.0825

  if (!appointment || !customer) return null

  const calculateSubtotal = () => {
    return appointment.price
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

  const handleAcknowledgeNotification = () => {
    setAcknowledged(true)
    toast.success('Customer arrival confirmed')
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

      onComplete(appointment.id, {
        paymentMethod,
        amountPaid: calculateTotal(),
        tip: tipAmount,
        discount: calculateDiscount()
      })

      toast.success(
        <div className="flex items-center space-x-2">
          <Check size={20} className="text-green-500" weight="bold" />
          <span>Payment processed & appointment completed!</span>
        </div>
      )

      setTipAmount(0)
      setDiscountPercent(0)
      setAcknowledged(false)
      setIsProcessing(false)
      onOpenChange(false)
    }, 1500)
  }

  const notificationSent = appointment.pickupNotificationSent
  const notificationAck = appointment.pickupNotificationAcknowledged || acknowledged

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard size={24} className="text-primary" />
            <span>Checkout - {appointment.petName}</span>
          </DialogTitle>
          <DialogDescription>
            Complete payment and mark as picked up
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
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

          <Card className={cn(
            'border-2 transition-all',
            notificationSent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {notificationSent ? (
                    <BellRinging size={20} className="text-green-600" weight="fill" />
                  ) : (
                    <Bell size={20} className="text-yellow-600" />
                  )}
                  <span className="font-semibold text-sm">Pickup Notification</span>
                </div>
                <Badge variant={notificationSent ? "default" : "secondary"}>
                  {notificationSent ? 'Sent' : 'Not Sent'}
                </Badge>
              </div>
              
              {notificationSent && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Customer has been notified that {appointment.petName} is ready for pickup.
                  </p>
                  
                  {!notificationAck && (
                    <Button 
                      onClick={handleAcknowledgeNotification}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Check size={16} className="mr-2" />
                      Acknowledge Customer Arrival
                    </Button>
                  )}
                  
                  {notificationAck && (
                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                      <Check size={16} weight="bold" />
                      <span>Customer arrival confirmed</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="frosted rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-sm">Payment Details</h3>

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
                  <SelectItem value="cashapp">Cash App</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
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
              disabled={!notificationAck || isProcessing}
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
            
            {!notificationAck && (
              <p className="text-xs text-center text-muted-foreground">
                Acknowledge customer arrival before checkout
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
