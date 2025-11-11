"use client"

import { useRouter } from "next/navigation"
import { useSupabaseData } from "./use-supabase-data"
import { useEffect } from "react"

export function usePrefetch() {
  const router = useRouter()
  const { loadData } = useSupabaseData()

  const prefetchRoute = (route: string) => {
    // Prefetch the route
    router.prefetch(route)
    
    // Preload data if it's a data-heavy route
    if (route === '/orders' || route === '/inventory') {
      loadData()
    }
  }

  // Prefetch common routes on mount
  useEffect(() => {
    const routes = ['/orders', '/inventory', '/dashboard', '/bill-history', '/settings']
    routes.forEach(route => {
      router.prefetch(route)
    })
  }, [router])

  return { prefetchRoute }
}
