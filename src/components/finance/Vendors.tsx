import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users as UsersIcon, Plus, Phone, Envelope } from '@phosphor-icons/react'
import { mockVendors } from '@/data/finance/mockData'
import type { Vendor } from '@/data/finance/types'

export function Vendors() {
  // TODO: Replace with API call - const { data: vendors } = useQuery('vendors', fetchVendors)
  const [vendors] = useState<Vendor[]>(mockVendors)

  const getStatusColor = (status: Vendor['status']) => {
    return status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
  }

  const activeVendors = vendors.filter(v => v.status === 'active')
  const totalPurchases = vendors.reduce((sum, v) => sum + v.totalPurchases, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" weight="bold" />
          Add Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Vendors</h3>
          <div className="text-3xl font-bold">{vendors.length}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Vendors</h3>
          <div className="text-3xl font-bold text-green-500">{activeVendors.length}</div>
        </Card>
        <Card className="frosted p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Purchases</h3>
          <div className="text-3xl font-bold">${totalPurchases.toFixed(2)}</div>
        </Card>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="frosted p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{vendor.name}</h3>
                <p className="text-sm text-muted-foreground">{vendor.contactName}</p>
              </div>
              <Badge className={getStatusColor(vendor.status)}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Envelope className="w-4 h-4 text-muted-foreground" weight="duotone" />
                <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                  {vendor.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" weight="duotone" />
                <a href={`tel:${vendor.phone}`} className="hover:underline">
                  {vendor.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{vendor.paymentTerms}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="font-medium">${vendor.totalPurchases.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Vendors Table */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4">All Vendors</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vendor Name</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Payment Terms</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total Purchases</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-3 font-medium">{vendor.name}</td>
                  <td className="p-3 text-sm">{vendor.contactName}</td>
                  <td className="p-3 text-sm">
                    <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                      {vendor.email}
                    </a>
                  </td>
                  <td className="p-3 text-sm">{vendor.phone}</td>
                  <td className="p-3 text-sm">{vendor.paymentTerms}</td>
                  <td className="p-3 text-right font-medium">${vendor.totalPurchases.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
