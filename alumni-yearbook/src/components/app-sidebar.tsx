"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  User,
  MessageCircle,
  ArrowUpFromLine,
  Bell,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Profile",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Yearbook",
          url: "/yearbook",
        },
        {
          title: "New Section Added",
          url: "/new_section",
        }
      ]
    },
    {
      title: "Message",
      url: "#",
      icon: MessageCircle,
      items: [
        {
          title: "Batchmates",
          url: "/message_batchmate",
        },
        {
          title: "Juniors",
          url: "/message_junior",
        },
      ],
    },
    {
      title: "New Yearbook Section",
      url: "#",
      icon: ArrowUpFromLine,
      items: [
        {
          title: "Photos",
          url: "/photos",
        },
        {
          title: "Add Yearbook Quote",
          url: "/quote",
        },
      ],
    },
    {
      title: "Contact Us",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Contact Us",
          url: "/contact_us",
        },]
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-white" 
      {...props}
    >
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}