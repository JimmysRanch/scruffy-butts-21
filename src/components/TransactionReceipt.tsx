import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Receipt, CreditCard, Money, Dog, User, Package } from '@phosphor-icons/react'

interface CartItem {
  service: {
    name: string
    price: number
  }
  quantity: number
}

interface TransactionData {
  id: string
  customerName?: string
  petName?: string
  staffName?: string
  service?: string
  items?: CartItem[]
  subtotal: number
  tax: number
  tip?: number
  discount?: number
  total: number
  paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
  timestamp?: string
  date?: string
  time?: string
}

interface TransactionReceiptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionData | null
}

export function TransactionReceipt({ open, onOpenChange, transaction }: TransactionReceiptProps) {
  if (!transaction) return null

  const formattedDate = transaction.timestamp 
    ? new Date(transaction.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : (transaction.date || 'N/A')

  const formattedTime = transaction.timestamp 
    ? new Date(transaction.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    : (transaction.time || 'N/A')

  const paymentMethodDisplay = transaction.paymentMethod === 'cashapp' 
    ? 'Cash App' 
    : transaction.paymentMethod === 'chime'
    ? 'Chime'
    : transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={20} />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="font-bold text-xl">Scruffy Butts</h2>
            <p className="text-sm text-muted-foreground">Professional Dog Grooming</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono">#{transaction.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{formattedTime}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User size={14} />
                  Customer:
                </span>
                <span className="font-medium">{transaction.customerName}</span>
              </div>
            )}
            {transaction.petName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Dog size={14} />
                  Pet:
                </span>
                <span className="font-medium">{transaction.petName}</span>
              </div>
            )}
            {transaction.staffName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Groomer:</span>
                <span className="font-medium">{transaction.staffName}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Package size={16} />
              Services / Items
            </h3>
            {transaction.service && (
              <div className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <p className="font-medium">{transaction.service}</p>
                </div>
                <p className="font-medium">
                  ${transaction.subtotal.toFixed(2)}
                </p>
              </div>
            )}
            {transaction.items && transaction.items.length > 0 && (
              <>
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.service.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      ${(item.service.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discount && transaction.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-${transaction.discount.toFixed(2)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
            )}
            {transaction.tip && transaction.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip:</span>
                <span>${transaction.tip.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Payment Method:</span>
            <Badge variant={transaction.paymentMethod === 'cash' ? 'secondary' : 'default'}>
              {transaction.paymentMethod === 'cash' ? (
                <div className="flex items-center gap-1">
                  <Money size={14} />
                  {paymentMethodDisplay}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CreditCard size={14} />
                  {paymentMethodDisplay}
                </div>
              )}
            </Badge>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">Thank you for your business!</p>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full" variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
