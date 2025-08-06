"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconReport,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { UserButton, useUser } from "@clerk/nextjs"

const data = {
  user: {
    name: "admin",
    email: "admin@kaidenz.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/products",
      icon: IconFolder,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconReport,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsers,
    }
  ],
  navSecondary: [],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
            >
              <Link href="#" className="hover:bg-transparent">
                <Image
                  src="/logo_light.png"
                  alt="Kaidenz Logo"
                  width={130}
                  height={130}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-4">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-lg border",
              }
            }}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName || user?.firstName || "User"}
            </p>
            <p className="text-xs text-white truncate">
              {user?.primaryEmailAddress?.emailAddress || "No email"}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
