"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

type Order = {
  id: number
  orderId: string
  customer: string
  total: number
  status: string
  date: string
}

interface ChartAreaInteractiveProps {
  orders: Order[]
}

export const description = "An interactive area chart showing order revenue"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#ffcb74",
  },
  orders: {
    label: "Orders",
    color: "#2f2f2f",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ orders }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Process orders data for chart
  const processChartData = React.useMemo(() => {
    const today = new Date()
    let daysToSubtract = 30
    
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "1d") {
      daysToSubtract = 1
    }
    
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    // Filter orders within the time range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date)
      return orderDate >= startDate && orderDate <= today
    })
    
    // Group orders by date and calculate daily totals
    const dailyData: { [key: string]: { revenue: number; count: number } } = {}
    
    // Initialize all dates in range with 0 values
    for (let i = 0; i <= daysToSubtract; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      dailyData[dateString] = { revenue: 0, count: 0 }
    }
    
    // Add actual order data
    filteredOrders.forEach(order => {
      if (dailyData[order.date]) {
        dailyData[order.date].revenue += order.total
        dailyData[order.date].count += 1
      }
    })
    
    // Convert to chart format
    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.count,
    }))
  }, [orders, timeRange])

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "1d":
        return "Today"
      case "7d":
        return "Last 7 days"
      case "30d":
        return "Last 30 days"
      default:
        return "Last 30 days"
    }
  }

  const totalRevenue = processChartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = processChartData.reduce((sum, item) => sum + item.orders, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Order Revenue</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Revenue and order count for {getTimeRangeLabel()}
          </span>
          <span className="@[540px]/card:hidden">{getTimeRangeLabel()}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="1d">Today</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1d" className="rounded-lg">
                Today
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">LKR {totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={processChartData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (timeRange === "1d") {
                  return date.toLocaleDateString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : Math.floor(processChartData.length / 2)}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    if (timeRange === "1d") {
                      return date.toLocaleDateString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
