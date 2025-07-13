import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import orders from "../orders.json"
import { OrdersTable } from "../../components/orders-table"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown, IconPackage } from "@tabler/icons-react"

export default function OrdersPage() {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter(order => order.status === "Processing").length
  const completedOrders = orders.filter(order => order.status === "Delivered").length

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Orders Stats Cards */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {totalOrders}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        All Time
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Total orders placed <IconPackage className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Since launch
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      ${totalRevenue.toFixed(2)}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        +12.5%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Revenue growth <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      This month
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Pending Orders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {pendingOrders}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingDown />
                        Processing
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Orders in progress
                    </div>
                    <div className="text-muted-foreground">
                      Need attention
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Completed Orders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {completedOrders}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        Delivered
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Successfully delivered <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Customer satisfaction
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Orders Table */}
              <div className="px-4 lg:px-6">
                <OrdersTable data={orders} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 