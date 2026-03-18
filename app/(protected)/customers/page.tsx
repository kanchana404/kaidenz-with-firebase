"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CustomersTable } from "@/components/customers-table"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown, IconUsers, IconUserCheck } from "@tabler/icons-react"
import { CustomersPageSkeleton } from "@/components/skeleton-loading"
import { useEffect, useState } from "react"

type Customer = {
  id: number
  user_id: string
  first_name: string
  last_name: string
  email: string
  password: string
  verification_code: string
  address?: {
    id?: number
    line1?: string
    line2?: string
    postal_code?: string
    phone?: number
    city?: {
      id?: number
      name?: string
    }
    province?: {
      id?: number
      name?: string
    }
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Raw customer data from backend:', data)
        
        // Validate and sanitize the data
        if (!Array.isArray(data)) {
          throw new Error('Backend returned invalid data format - expected array')
        }
        
        // Filter out customers with invalid address data and log them
        const validCustomers = data.filter((customer: Customer) => {
          if (!customer.address || !customer.address.city || !customer.address.city.name) {
            console.warn('Customer with missing address data:', customer)
            return false
          }
          return true
        })
        
        console.log('Valid customers with complete address data:', validCustomers.length)
        setCustomers(validCustomers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers')
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const totalCustomers = customers.length
  const verifiedCustomers = customers.filter(customer => customer.verification_code === "verified").length
  const unverifiedCustomers = customers.filter(customer => customer.verification_code !== "verified").length
  const customersPercentageVerified = totalCustomers > 0 ? Math.round((verifiedCustomers / totalCustomers) * 100) : 0

  if (loading) {
    return <CustomersPageSkeleton />
  }

  if (error) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600">Error Loading Customers</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
                    <CardDescription>Verified Customers</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {verifiedCustomers}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        {customersPercentageVerified}%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Account verified <IconUserCheck className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Email verified users
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Cities Covered</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {(() => {
                        const citiesWithData = customers.filter(customer => customer.address?.city?.name)
                        return citiesWithData.length > 0 
                          ? new Set(citiesWithData.map(customer => customer.address!.city!.name)).size
                          : 0
                      })()}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        Geographic Reach
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Service locations <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Unique cities
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Unverified Customers</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {unverifiedCustomers}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingDown />
                        Need Verification
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Verification pending <IconTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Email not verified
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