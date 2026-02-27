"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Car,
  BarChart3,
  Cpu,
  TrendingUp,
  Shield,
  Globe,
  FileText,
  BarChart2,
} from "lucide-react"

const links = [
  { href: "/", label: "Analyze", icon: TrendingUp },
  { href: "/market", label: "Market", icon: BarChart3 },
  { href: "/trends", label: "Trends", icon: BarChart2 },
  { href: "/ethics", label: "Ethical AI", icon: Shield },
  { href: "/impact", label: "Impact", icon: Globe },
  { href: "/report", label: "AI Report", icon: FileText },
  { href: "/tech", label: "Architecture", icon: Cpu },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center group-hover:bg-amber-600 transition-colors">
              <Car size={15} className="text-card" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight">
              Vroom<span className="text-accent">ly</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar ml-4">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-amber-100 text-amber-900"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
