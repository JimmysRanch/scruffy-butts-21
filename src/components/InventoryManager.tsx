import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Package, Warning, TrendUp, TrendDown, MagnifyingGlass, Minus, Archive, ShoppingCart } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface InventoryItem {
  id: string
  name: string
  category: 'shampoo' | 'conditioner' | 'tools' | 'accessories' | 'treats' | 'other'
  sku: string
  quantity: number
  unit: string
  reorderLevel: number
  reorderQuantity: number
  costPerUnit: number
  sellingPrice: number
  supplier: string
  location: string
  notes?: string
  lastRestocked?: string
  expiryDate?: string
}

interface InventoryTransaction {
  id: string
  itemId: string
  itemName: string
  type: 'restock' | 'usage' | 'sale' | 'adjustment' | 'expired' | 'damaged'
  quantity: number
  previousQuantity: number
  newQuantity: number
  date: string
  notes?: string
  performedBy?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  notes?: string
}

export function InventoryManager() {
  const [items, setItems] = useKV<InventoryItem[]>('inventory-items', [])
  const [transactions, setTransactions] = useKV<InventoryTransaction[]>('inventory-transactions', [])
  const [suppliers, setSuppliers] = useKV<Supplier[]>('inventory-suppliers', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'shampoo',
    sku: '',
    quantity: 0,
    unit: 'bottle',
    reorderLevel: 5,
    reorderQuantity: 10,
    costPerUnit: 0,
    sellingPrice: 0,
    supplier: '',
    location: '',
    notes: ''
  })

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    notes: ''
  })

  const [transactionForm, setTransactionForm] = useState({
    type: 'restock' as InventoryTransaction['type'],
    quantity: 0,
    notes: ''
  })

  const categories = [
    { value: 'shampoo', label: 'Shampoos' },
    { value: 'conditioner', label: 'Conditioners' },
    { value: 'tools', label: 'Tools & Equipment' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'treats', label: 'Treats & Rewards' },
    { value: 'other', label: 'Other' }
  ]

  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = (items || []).filter(item => item.quantity <= item.reorderLevel)
  const totalValue = (items || []).reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)
  const totalItems = (items || []).reduce((sum, item) => sum + item.quantity, 0)

  const handleAddItem = () => {
    if (!newItem.name || !newItem.sku) {
      toast.error('Please fill in all required fields')
      return
    }

    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newItem.name!,
      category: newItem.category as InventoryItem['category'],
      sku: newItem.sku!,
      quantity: newItem.quantity || 0,
      unit: newItem.unit || 'bottle',
      reorderLevel: newItem.reorderLevel || 5,
      reorderQuantity: newItem.reorderQuantity || 10,
      costPerUnit: newItem.costPerUnit || 0,
      sellingPrice: newItem.sellingPrice || 0,
      supplier: newItem.supplier || '',
      location: newItem.location || '',
      notes: newItem.notes,
      lastRestocked: new Date().toISOString()
    }

    setItems(current => [...(current || []), item])
    
    if (item.quantity > 0) {
      const transaction: InventoryTransaction = {
        id: `txn-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        type: 'restock',
        quantity: item.quantity,
        previousQuantity: 0,
        newQuantity: item.quantity,
        date: new Date().toISOString(),
        notes: 'Initial stock'
      }
      setTransactions(current => [...(current || []), transaction])
    }

    setNewItem({
      name: '',
      category: 'shampoo',
      sku: '',
      quantity: 0,
      unit: 'bottle',
      reorderLevel: 5,
      reorderQuantity: 10,
      costPerUnit: 0,
      sellingPrice: 0,
      supplier: '',
      location: '',
      notes: ''
    })
    setIsAddDialogOpen(false)
    toast.success('Item added to inventory')
  }

  const handleUpdateItem = () => {
    if (!editingItem) return

    setItems(current =>
      (current || []).map(item => item.id === editingItem.id ? editingItem : item)
    )
    setEditingItem(null)
    toast.success('Item updated successfully')
  }

  const handleTransaction = (item: InventoryItem) => {
    const { type, quantity, notes } = transactionForm
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    let newQuantity = item.quantity
    
    if (type === 'restock') {
      newQuantity += quantity
    } else {
      newQuantity -= quantity
      if (newQuantity < 0) {
        toast.error('Insufficient stock for this transaction')
        return
      }
    }

    const transaction: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type,
      quantity,
      previousQuantity: item.quantity,
      newQuantity,
      date: new Date().toISOString(),
      notes
    }

    setTransactions(current => [...(current || []), transaction])
    setItems(current =>
      (current || []).map(i => i.id === item.id 
        ? { ...i, quantity: newQuantity, lastRestocked: type === 'restock' ? new Date().toISOString() : i.lastRestocked }
        : i
      )
    )

    setTransactionForm({ type: 'restock', quantity: 0, notes: '' })
    setSelectedItem(null)
    setIsTransactionDialogOpen(false)
    toast.success('Transaction recorded successfully')
  }

  const handleAddSupplier = () => {
    if (!newSupplier.name) {
      toast.error('Supplier name is required')
      return
    }

    const supplier: Supplier = {
      id: `supplier-${Date.now()}`,
      name: newSupplier.name!,
      contact: newSupplier.contact || '',
      email: newSupplier.email || '',
      phone: newSupplier.phone || '',
      notes: newSupplier.notes
    }

    setSuppliers(current => [...(current || []), supplier])
    setNewSupplier({ name: '', contact: '', email: '', phone: '', notes: '' })
    setIsSupplierDialogOpen(false)
    toast.success('Supplier added successfully')
  }

  const handleDeleteItem = (id: string) => {
    setItems(current => (current || []).filter(item => item.id !== id))
    toast.success('Item removed from inventory')
  }

  const getCategoryIcon = (category: string) => {
    return <Package weight="duotone" />
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
    if (item.quantity <= item.reorderLevel) return { label: 'Low Stock', variant: 'secondary' as const }
    return { label: 'In Stock', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track supplies, manage stock levels, and monitor usage</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2" size={18} />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>Add a supplier for your inventory items</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplier-name">Supplier Name *</Label>
                  <Input
                    id="supplier-name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="ABC Pet Supplies"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-contact">Contact Person</Label>
                  <Input
                    id="supplier-contact"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-email">Email</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-phone">Phone</Label>
                  <Input
                    id="supplier-phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-notes">Notes</Label>
                  <Textarea
                    id="supplier-notes"
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
                <Button onClick={handleAddSupplier} className="w-full">Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" size={18} />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>Add a new product to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="item-name">Item Name *</Label>
                  <Input
                    id="item-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Premium Dog Shampoo"
                  />
                </div>
                <div>
                  <Label htmlFor="item-category">Category</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value as InventoryItem['category'] })}>
                    <SelectTrigger id="item-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-sku">SKU *</Label>
                  <Input
                    id="item-sku"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="SHP-001"
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity">Initial Quantity</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="item-unit">Unit</Label>
                  <Input
                    id="item-unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="bottle, tube, piece"
                  />
                </div>
                <div>
                  <Label htmlFor="item-reorder">Reorder Level</Label>
                  <Input
                    id="item-reorder"
                    type="number"
                    value={newItem.reorderLevel}
                    onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="item-reorder-qty">Reorder Quantity</Label>
                  <Input
                    id="item-reorder-qty"
                    type="number"
                    value={newItem.reorderQuantity}
                    onChange={(e) => setNewItem({ ...newItem, reorderQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="item-cost">Cost Per Unit ($)</Label>
                  <Input
                    id="item-cost"
                    type="number"
                    step="0.01"
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="item-price">Selling Price ($)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="item-supplier">Supplier</Label>
                  <Select value={newItem.supplier} onValueChange={(value) => setNewItem({ ...newItem, supplier: value })}>
                    <SelectTrigger id="item-supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {(suppliers || []).map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-location">Location</Label>
                  <Input
                    id="item-location"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="Shelf A-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="item-notes">Notes</Label>
                  <Textarea
                    id="item-notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Additional notes about this item..."
                  />
                </div>
                <Button onClick={handleAddItem} className="col-span-2">Add to Inventory</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">{(items || []).length} unique products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">At cost price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(suppliers || []).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="lowstock">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>Manage your stock and track usage</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first inventory item to get started'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => {
                      const status = getStockStatus(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.location && <div className="text-xs text-muted-foreground">{item.location}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categories.find(c => c.value === item.category)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{item.quantity}</span> {item.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">${(item.quantity * item.costPerUnit).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setTransactionForm({ type: 'restock', quantity: 0, notes: '' })
                                  setIsTransactionDialogOpen(true)
                                }}
                              >
                                <TrendUp size={16} className="mr-1" />
                                Restock
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setTransactionForm({ type: 'usage', quantity: 0, notes: '' })
                                  setIsTransactionDialogOpen(true)
                                }}
                              >
                                <TrendDown size={16} className="mr-1" />
                                Use
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingItem(item)
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowstock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items that need to be reordered</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All stocked up!</h3>
                  <p className="text-muted-foreground">No items are below their reorder level</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Warning size={24} className="text-warning" weight="duotone" />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {item.quantity} {item.unit} | Reorder at: {item.reorderLevel} {item.unit}
                          </div>
                          {item.supplier && (
                            <div className="text-sm text-muted-foreground">Supplier: {item.supplier}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.quantity === 0 ? 'destructive' : 'secondary'}>
                          {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setTransactionForm({ type: 'restock', quantity: item.reorderQuantity, notes: '' })
                            setIsTransactionDialogOpen(true)
                          }}
                        >
                          Reorder {item.reorderQuantity} {item.unit}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              {(transactions || []).length === 0 ? (
                <div className="text-center py-12">
                  <Archive size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">Transaction history will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...(transactions || [])].reverse().slice(0, 50).map(txn => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">{format(new Date(txn.date), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-medium">{txn.itemName}</TableCell>
                        <TableCell>
                          <Badge variant={txn.type === 'restock' ? 'default' : 'secondary'}>
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={txn.type === 'restock' ? 'text-green-600' : 'text-red-600'}>
                          {txn.type === 'restock' ? '+' : '-'}{txn.quantity}
                        </TableCell>
                        <TableCell>{txn.previousQuantity}</TableCell>
                        <TableCell className="font-semibold">{txn.newQuantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{txn.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>Manage your supplier contacts</CardDescription>
            </CardHeader>
            <CardContent>
              {(suppliers || []).length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No suppliers yet</h3>
                  <p className="text-muted-foreground mb-4">Add suppliers to track your inventory sources</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(suppliers || []).map(supplier => (
                    <Card key={supplier.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {supplier.contact && (
                          <div>
                            <span className="text-muted-foreground">Contact:</span> {supplier.contact}
                          </div>
                        )}
                        {supplier.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span> {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span> {supplier.phone}
                          </div>
                        )}
                        {supplier.notes && (
                          <div>
                            <span className="text-muted-foreground">Notes:</span> {supplier.notes}
                          </div>
                        )}
                        <div className="pt-2">
                          <span className="text-muted-foreground">Items:</span>{' '}
                          {(items || []).filter(item => item.supplier === supplier.name).length}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
              {selectedItem ? `Update stock for ${selectedItem.name}` : 'Record inventory transaction'}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Current Stock</div>
                <div className="text-2xl font-bold">{selectedItem.quantity} {selectedItem.unit}</div>
              </div>
              <div>
                <Label htmlFor="txn-type">Transaction Type</Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value as InventoryTransaction['type'] })}
                >
                  <SelectTrigger id="txn-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Restock</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="txn-quantity">Quantity</Label>
                <Input
                  id="txn-quantity"
                  type="number"
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm({ ...transactionForm, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="txn-notes">Notes</Label>
                <Textarea
                  id="txn-notes"
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                  placeholder="Optional notes about this transaction..."
                />
              </div>
              <Button onClick={() => handleTransaction(selectedItem)} className="w-full">
                Record Transaction
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editingItem.category} onValueChange={(value) => setEditingItem({ ...editingItem, category: value as InventoryItem['category'] })}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={editingItem.sku}
                  onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-reorder">Reorder Level</Label>
                <Input
                  id="edit-reorder"
                  type="number"
                  value={editingItem.reorderLevel}
                  onChange={(e) => setEditingItem({ ...editingItem, reorderLevel: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-reorder-qty">Reorder Quantity</Label>
                <Input
                  id="edit-reorder-qty"
                  type="number"
                  value={editingItem.reorderQuantity}
                  onChange={(e) => setEditingItem({ ...editingItem, reorderQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-cost">Cost Per Unit ($)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={editingItem.costPerUnit}
                  onChange={(e) => setEditingItem({ ...editingItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Selling Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingItem.sellingPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Select value={editingItem.supplier} onValueChange={(value) => setEditingItem({ ...editingItem, supplier: value })}>
                  <SelectTrigger id="edit-supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(suppliers || []).map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button onClick={handleUpdateItem} className="flex-1">Save Changes</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteItem(editingItem.id)
                    setEditingItem(null)
                  }}
                >
                  Delete Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
