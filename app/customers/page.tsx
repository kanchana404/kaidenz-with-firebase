import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import customers from "../customers.json"
import { CustomersTable } from "../../components/customers-table"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown, IconUsers, IconUserCheck } from "@tabler/icons-react"

export default function CustomersPage() {
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(customer => customer.status === "Active").length
  const inactiveCustomers = customers.filter(customer => customer.status === "Inactive").length
  const newCustomersThisMonth = customers.filter(customer => {
    const joinDate = new Date(customer.joined)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
  }).length

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
              {/* Customer Stats Cards */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Customers</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {totalCustomers}
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
                      Registered customers <IconUsers className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Since launch
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Active Customers</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {activeCustomers}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        {Math.round((activeCustomers / totalCustomers) * 100)}%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Currently active <IconUserCheck className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      High engagement
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>New This Month</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {newCustomersThisMonth}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        +15.2%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      New registrations <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      This month
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Inactive Customers</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {inactiveCustomers}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingDown />
                        Need Attention
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Re-engagement needed <IconTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Potential churn risk
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Customers Table */}
              <div className="px-4 lg:px-6">
                <CustomersTable data={customers} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 