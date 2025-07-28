import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

interface SectionCardsProps {
  orders: Order[]
}

export function SectionCards({ orders }: SectionCardsProps) {
  // Calculate different time periods
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Filter orders by time periods
  const todayOrders = orders.filter(order => order.date === todayString)
  const last7DaysOrders = orders.filter(order => {
    const orderDate = new Date(order.date)
    return orderDate >= sevenDaysAgo && orderDate <= today
  })
  const last30DaysOrders = orders.filter(order => {
    const orderDate = new Date(order.date)
    return orderDate >= thirtyDaysAgo && orderDate <= today
  })

  // Calculate totals
  const todayTotal = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const last7DaysTotal = last7DaysOrders.reduce((sum, order) => sum + order.total, 0)
  const last30DaysTotal = last30DaysOrders.reduce((sum, order) => sum + order.total, 0)
  const allTimeTotal = orders.reduce((sum, order) => sum + order.total, 0)

  // Calculate order counts
  const todayCount = todayOrders.length
  const last7DaysCount = last7DaysOrders.length
  const last30DaysCount = last30DaysOrders.length
  const allTimeCount = orders.length

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${todayTotal.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {todayCount} orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Today's sales <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {todayCount} orders today
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Last 7 Days</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${last7DaysTotal.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {last7DaysCount} orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Weekly revenue <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {last7DaysCount} orders this week
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Last 30 Days</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${last30DaysTotal.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {last30DaysCount} orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Monthly revenue <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {last30DaysCount} orders this month
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>All Time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${allTimeTotal.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {allTimeCount} orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total revenue <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {allTimeCount} total orders
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
