"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  status: string
  joined: string
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
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer) => (
          <TableRow key={customer.id} data-state={selected.includes(customer.id) ? "selected" : undefined}>
            <TableCell>
              <Checkbox checked={selected.includes(customer.id)} onCheckedChange={() => toggleRow(customer.id)} aria-label="Select row" />
            </TableCell>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell><Badge variant="outline">{customer.status}</Badge></TableCell>
            <TableCell>{customer.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 