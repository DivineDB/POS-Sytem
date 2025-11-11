"use client"

import { Badge, LayoutDashboard, Menu, Settings, Package, Receipt } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePrefetch } from "@/hooks/use-prefetch"

const NavItem = ({
  icon: Icon,
  label,
  href,
  active = false,
  onHover,
}: { icon: any; label: string; href: string; active?: boolean; onHover?: () => void }) => (
  <Link
    href={href}
    onMouseEnter={onHover}
    className={cn(
      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-in-out",
      "hover:scale-[1.02] hover:shadow-sm",
      active 
        ? "bg-[var(--pos-brand)] text-foreground shadow-md transform scale-[1.02]" 
        : "text-foreground/70 hover:bg-[var(--pos-panel)] hover:text-foreground"
    )}
    aria-current={active ? "page" : undefined}
  >
    <Icon size={18} aria-hidden className={cn("transition-transform duration-200", active && "scale-110")} />
    <span className="text-pretty font-medium">{label}</span>
  </Link>
)

export function Sidebar() {
  const pathname = usePathname()
  const { prefetchRoute } = usePrefetch()

  return (
    <aside className="pos-panel w-64 shrink-0 p-4 flex flex-col gap-4">
      <header className="flex items-center gap-2 px-1">
        <Menu className="h-5 w-5" aria-hidden />
        <span className="font-semibold">SSG Store</span>
      </header>

      <nav className="grid gap-1">
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/dashboard" 
          active={pathname === "/dashboard"}
          onHover={() => prefetchRoute("/dashboard")}
        />
        <NavItem 
          icon={Badge} 
          label="New Order" 
          href="/orders" 
          active={pathname === "/orders"}
          onHover={() => prefetchRoute("/orders")}
        />
        <NavItem 
          icon={Package} 
          label="Inventory" 
          href="/inventory" 
          active={pathname === "/inventory"}
          onHover={() => prefetchRoute("/inventory")}
        />
        <NavItem 
          icon={Receipt} 
          label="Bill History" 
          href="/bill-history" 
          active={pathname === "/bill-history"}
          onHover={() => prefetchRoute("/bill-history")}
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          href="/settings" 
          active={pathname === "/settings"}
          onHover={() => prefetchRoute("/settings")}
        />
      </nav>

      <div className="mt-auto">
        <div className="text-xs text-foreground/60 mb-2">Active Users</div>
        <div className="flex flex-col gap-2">
          {[
            { name: "Krish", color: "bg-violet-500" },
            { name: "Vipin A", color: "bg-emerald-500" },
          ].map((u) => (
            <div key={u.name} className="flex items-center gap-2">
              <span className={cn("h-6 w-6 rounded-full", u.color)} aria-hidden />
              <div className="pos-panel flex-1 rounded-full px-3 py-1 text-xs">{u.name}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-foreground/50 mt-6">© 2025 DivineLabs</div>
      </div>
    </aside>
  )
}
