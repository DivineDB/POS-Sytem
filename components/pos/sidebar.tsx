"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Badge, LayoutDashboard, Menu, Settings, Package, Receipt, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePrefetch } from "@/hooks/use-prefetch"
import { toast } from "sonner"

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
      "active:scale-[0.98] active:bg-[var(--pos-panel)]",
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background",
      active 
        ? "bg-[var(--pos-brand)] text-[oklch(0.15_0_0)] shadow-md scale-[1.02]" 
        : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground"
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
  const router = useRouter()
  const { prefetchRoute } = usePrefetch()
  const { user, signOut, switchRole } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const role = user?.user_metadata?.role || "owner"

  // Allowed pages per role mapping
  const currentAllowed = useMemo(() => {
    const allowedPaths: Record<string, string[]> = {
      owner: ["/dashboard", "/orders", "/inventory", "/bill-history", "/settings"],
      cashier: ["/orders", "/bill-history"],
      worker: ["/inventory"],
    }
    return allowedPaths[role] || allowedPaths.owner
  }, [role])

  // Navigation config items
  const navigationItems = useMemo(() => [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Badge, label: "New Order", href: "/orders" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Receipt, label: "Bill History", href: "/bill-history" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ], [])

  const visibleItems = useMemo(() => {
    return navigationItems.filter((item) => currentAllowed.includes(item.href))
  }, [navigationItems, currentAllowed])

  // Route protection client-side redirect guard
  useEffect(() => {
    if (!user) return

    if (!currentAllowed.includes(pathname)) {
      const fallbackPath = currentAllowed[0] || "/orders"
      router.push(fallbackPath)
      toast.info(`Restricted access: Redirected to ${fallbackPath === "/orders" ? "New Order" : "Inventory"}`)
    }
  }, [role, pathname, user, router, currentAllowed])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <aside className="pos-panel w-64 shrink-0 p-4 flex flex-col gap-4">
      <header className="flex items-center gap-2 px-1">
        <Menu className="h-5 w-5" aria-hidden />
        <span className="font-semibold">SSG Store</span>
      </header>

      <nav className="grid gap-1">
        {visibleItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            onHover={() => prefetchRoute(item.href)}
          />
        ))}
      </nav>

      {/* Dynamic Profile Section */}
      <div className="mt-auto pt-4 border-t border-[var(--pos-stroke)]">
        {user ? (
          <div className="flex items-center justify-between gap-2.5 relative" ref={dropdownRef}>
            {/* Avatar & User Details */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={cn(
                "h-8 w-8 rounded-full text-[oklch(0.15_0_0)] flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-inner",
                role === 'cashier' ? 'bg-[var(--pos-accent-purple)]' : role === 'worker' ? 'bg-[var(--pos-accent-blue)]' : 'bg-[var(--pos-brand)]'
              )}>
                {(user.user_metadata?.full_name || user.email)?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-foreground/60 truncate">
                  {user.user_metadata?.role ? user.user_metadata.role.charAt(0).toUpperCase() + user.user_metadata.role.slice(1) : 'Owner'}
                </p>
              </div>
            </div>

            {/* Custom Account Switcher Button (Right next to user details) */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-[var(--pos-panel-2)] active:bg-foreground/5 text-foreground/80 border border-[var(--pos-stroke)] rounded-lg transition duration-200 cursor-pointer shadow-sm group focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] shrink-0 flex items-center justify-center"
              title="Switch Account"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 opacity-60 group-active:opacity-100", isOpen && "rotate-180")} />
            </button>

            {/* Popover Menu (opens above, absolute positioned) */}
            {isOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-200">
                {[
                  { role: 'owner', name: 'Admin Cashier', title: 'Owner', initials: 'AC', desc: 'Full administration', color: 'bg-[var(--pos-brand)] text-[oklch(0.15_0_0)]', dot: 'bg-[var(--pos-brand)]' },
                  { role: 'cashier', name: 'Sarah Cashier', title: 'Cashier', initials: 'SC', desc: 'Sales & orders', color: 'bg-[var(--pos-accent-purple)] text-[oklch(0.15_0_0)]', dot: 'bg-[var(--pos-accent-purple)]' },
                  { role: 'worker', name: 'John Worker', title: 'Worker', initials: 'JW', desc: 'Inventory management', color: 'bg-[var(--pos-accent-blue)] text-[oklch(0.15_0_0)]', dot: 'bg-[var(--pos-accent-blue)]' },
                ].map((acc) => {
                  const isActive = (user.user_metadata?.role || 'owner') === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => {
                        switchRole(acc.role as any);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-all duration-150 cursor-pointer",
                        isActive 
                          ? "bg-foreground/[0.04] border border-[var(--pos-stroke)]" 
                          : "active:bg-foreground/[0.03] border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm",
                        acc.color
                      )}>
                        {acc.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <p className="text-xs font-bold text-foreground truncate">{acc.name}</p>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{acc.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{acc.desc}</p>
                      </div>
                      {isActive && (
                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", acc.dot)} />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-foreground/40">
            Offline Mode
          </div>
        )}
        <div className="text-[10px] text-foreground/60 text-center mt-3">© 2026 DivineLabs</div>
      </div>
    </aside>
  )
}

