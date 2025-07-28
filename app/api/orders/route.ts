import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/kaidenz/GetOders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const orders = await response.json()
    
    // Transform the data to match the expected frontend structure
    const transformedOrders = orders.map((order: any, index: number) => ({
      id: index + 1, // Add an id field for the table
      orderId: order.orderId,
      customer: order.customer,
      total: order.total,
      status: order.status,
      date: order.date,
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 