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
      "w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 ease-in-out min-h-[44px]",
      "hover:scale-[1.02] hover:shadow-sm",
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background",
      active 
        ? "bg-[var(--pos-brand)] text-[oklch(0.15_0_0)] shadow-md transform scale-[1.02]" 
        : "text-foreground/80 hover:bg-[var(--pos-panel)] hover:text-foreground"
    )}
    aria-current={active ? "page" : undefined}
  >
    <Icon size={18} aria-hidden className={cn("transition-transform duration-200", active && "scale-110")} />
    <span className="text-pretty font-medium">{label}</span>
  </Link>
)

import { useAuth } from "@/context/auth-context"
import { LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { prefetchRoute } = usePrefetch()
  const { user, signOut } = useAuth()

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

      {/* Dynamic Profile Section */}
      <div className="mt-auto pt-4 border-t border-[var(--pos-stroke)] space-y-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[var(--pos-brand)] to-[var(--pos-accent-blue)] text-[oklch(0.15_0_0)] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {(user.user_metadata?.full_name || user.email)?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-xs font-semibold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-foreground/40">
            Offline Mode
          </div>
        )}
        <div className="text-[10px] text-foreground/60 text-center">© 2026 DivineLabs</div>
      </div>
    </aside>
  )
}

