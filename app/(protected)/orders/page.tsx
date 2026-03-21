"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Truck,
  Package2,
  PackageCheck,
  MoreHorizontal,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { OrdersPageSkeleton } from "@/components/skeleton-loading"
import { toast } from "sonner"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

type OrderStatus = "paid" | "processing" | "packed" | "on-delivery" | "delivered" | "cancelled"

const statusConfig = {
  paid: { 
    label: "Paid", 
    variant: "outline" as const, 
    icon: CheckCircle,
    color: "text-green-600"
  },
  processing: { 
    label: "Processing", 
    variant: "outline" as const, 
    icon: Package2,
    color: "text-blue-600"
  },
  packed: { 
    label: "Packed", 
    variant: "outline" as const, 
    icon: Package,
    color: "text-purple-600"
  },
  "on-delivery": { 
    label: "On Delivery", 
    variant: "outline" as const, 
    icon: Truck,
    color: "text-orange-600"
  },
  delivered: { 
    label: "Delivered", 
    variant: "outline" as const, 
    icon: PackageCheck,
    color: "text-green-600"
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive" as const, 
    icon: Clock,
    color: "text-red-600"
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      
      // Find the order to get the actual orderId from backend
      const order = orders.find(o => o.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }
      
      // API call to update order status using the backend orderId
      const response = await fetch(`/api/orders/${order.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
        toast.success("Order status updated successfully", {
          description: `Order ${order.orderId} status changed to ${statusConfig[newStatus].label}`
        })
      } else {
        throw new Error(result.error || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      toast.error("Failed to update order status", {
        description: err instanceof Error ? err.message : "An error occurred"
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as OrderStatus] || statusConfig.paid
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    )
  }

  // Normalize status to ensure it matches our OrderStatus type
  const normalizeStatus = (status: string): OrderStatus => {
    const normalizedStatus = status.toLowerCase().replace(/[^a-z-]/g, '') as OrderStatus
    return Object.keys(statusConfig).includes(normalizedStatus) ? normalizedStatus : 'paid'
  }

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const deliveredOrders = orders.filter(order => order.status === "delivered").length
  const paidOrders = orders.filter(order => order.status === "paid").length

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      description: "All time orders",
      icon: Package,
      trend: "neutral"
    },
    {
      title: "Revenue",
      value: `LKR ${totalRevenue.toLocaleString()}`,
      description: "+12.5% from last month",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Delivered",
      value: deliveredOrders.toString(),
      description: "Successfully delivered",
      icon: PackageCheck,
      trend: "up"
    },
    {
      title: "Paid Orders",
      value: paidOrders.toString(),
      description: "Payment received",
      icon: CheckCircle,
      trend: "up"
    }
  ]

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "280px",
          "--header-height": "60px",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <OrdersPageSkeleton />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "280px",
          "--header-height": "60px",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading orders</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "280px",
        "--header-height": "60px",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track your order history
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {stat.trend === "up" && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      {stat.trend === "down" && (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span>{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage order statuses and track deliveries
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {totalOrders} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const normalizedStatus = normalizeStatus(order.status)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.orderId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.customer}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(normalizedStatus)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            LKR {order.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={normalizedStatus}
                                onValueChange={(value: OrderStatus) => 
                                  updateOrderStatus(order.id, value)
                                }
                                disabled={updatingOrderId === order.id}
                              >
                                <SelectTrigger className="h-8 w-[140px]">
                                  {updatingOrderId === order.id ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span className="text-xs">Updating...</span>
                                    </div>
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paid">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      Paid
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="processing">
                                    <div className="flex items-center gap-2">
                                      <Package2 className="h-3 w-3 text-blue-600" />
                                      Processing
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="packed">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-3 w-3 text-purple-600" />
                                      Packed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="on-delivery">
                                    <div className="flex items-center gap-2">
                                      <Truck className="h-3 w-3 text-orange-600" />
                                      On Delivery
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="delivered">
                                    <div className="flex items-center gap-2">
                                      <PackageCheck className="h-3 w-3 text-green-600" />
                                      Delivered
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-red-600" />
                                      Cancelled
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={updatingOrderId === order.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}