"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

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

export function CustomersTable({ data }: { data: Customer[] }) {
  const [selected, setSelected] = React.useState<number[]>([])
  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }
  const allSelected = selected.length === data.length && data.length > 0
  const toggleAll = () => {
    setSelected(allSelected ? [] : data.map((c) => c.id))
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Province</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer) => (
          <TableRow key={customer.id} data-state={selected.includes(customer.id) ? "selected" : undefined}>
            <TableCell>
              <Checkbox checked={selected.includes(customer.id)} onCheckedChange={() => toggleRow(customer.id)} aria-label="Select row" />
            </TableCell>
            <TableCell>{`${customer.first_name} ${customer.last_name}`}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.address?.phone || 'N/A'}</TableCell>
            <TableCell>{customer.address?.city?.name || 'N/A'}</TableCell>
            <TableCell>{customer.address?.province?.name || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant={customer.verification_code === "verified" ? "default" : "secondary"}>
                {customer.verification_code === "verified" ? "Verified" : "Unverified"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 