"use client"

import {

  type Icon,
} from "@tabler/icons-react"

import {
  DropdownMenu,

} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,

  SidebarMenu,

  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">

      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>

            </SidebarMenuButton>
            <DropdownMenu>



            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>

        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
