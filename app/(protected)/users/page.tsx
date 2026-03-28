"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconTrendingUp, IconTrendingDown, IconUsers, IconUserCheck } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

type User = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  profileImageUrl: string
  phone: string
  verification_code: string
  address?: {
    line1?: string
    line2?: string
    postal_code?: string
    phone?: number | string
    city?: {
      name?: string
    }
    province?: {
      name?: string
    }
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/customers')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Backend returned invalid data format - expected array')
        }
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const totalUsers = users.length
  const verifiedUsers = users.filter(u => u.verification_code === "verified").length
  const unverifiedUsers = users.filter(u => u.verification_code !== "verified").length
  const percentageVerified = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
  const citiesCount = (() => {
    const cities = users.filter(u => u.address?.city?.name).map(u => u.address!.city!.name)
    return new Set(cities).size
  })()

  if (loading) {
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
                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="@container/card">
                      <CardHeader>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24 mt-2" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                <div className="px-4 lg:px-6">
                  <Skeleton className="h-96 w-full" />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
              <h2 className="text-lg font-semibold text-red-600">Error Loading Users</h2>
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
              {/* Page Header */}
              <div className="px-4 lg:px-6 space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Registered Users</h1>
                <p className="text-sm text-muted-foreground">
                  All registered users from the app
                </p>
              </div>

              {/* Stats Cards */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {totalUsers}
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
                      Registered users <IconUsers className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Since launch
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Verified Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {verifiedUsers}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        {percentageVerified}%
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
                      {citiesCount}
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
                    <CardDescription>Unverified Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {unverifiedUsers}
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

              {/* Users Table */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-medium">All Registered Users</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Users registered through the mobile app
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {totalUsers} users
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Province</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {user.profileImageUrl ? (
                                    <img
                                      src={user.profileImageUrl}
                                      alt={`${user.first_name} ${user.last_name}`}
                                      className="h-9 w-9 rounded-full object-cover border border-border"
                                    />
                                  ) : (
                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                      {user.first_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                  )}
                                  <span className="font-medium">{`${user.first_name} ${user.last_name}`}</span>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone || user.address?.phone || 'N/A'}</TableCell>
                              <TableCell>{user.address?.city?.name || 'N/A'}</TableCell>
                              <TableCell>{user.address?.province?.name || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
