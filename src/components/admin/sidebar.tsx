"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Tags,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Image,
  Mail,
  Search,
} from "lucide-react"

const sidebarItems = [
  {
    title: "نظرة عامة",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "المقالات",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "التصنيفات",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "التعليقات",
    href: "/admin/comments",
    icon: MessageSquare,
  },
  {
    title: "الوسائط",
    href: "/admin/media",
    icon: Image,
  },
  {
    title: "المستخدمون",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "التحليلات",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "النشرة البريدية",
    href: "/admin/newsletter",
    icon: Mail,
  },
  {
    title: "البحث",
    href: "/admin/search",
    icon: Search,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-l bg-muted/10">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                )}
              >
                <item.icon className="ml-3 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

