"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

const mockUser: User = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "guest@ssgstore.com",
  app_metadata: {},
  user_metadata: {
    full_name: "Divyansh",
    role: "owner"
  },
  aud: "authenticated",
  created_at: new Date().toISOString()
}

const getPersistedMockUser = (): User => {
  if (typeof window === 'undefined') return mockUser
  try {
    const savedName = localStorage.getItem('ssg_mock_cashier_name')
    if (savedName) {
      // Strip legacy bracket role suffix e.g. "Divyansh (Owner)" -> "Divyansh"
      const cleanName = savedName.replace(/\s*\([^)]+\)\s*$/, '').trim()
      // Persist the cleaned name back to remove old format
      if (cleanName !== savedName) {
        localStorage.setItem('ssg_mock_cashier_name', cleanName)
      }
      return {
        ...mockUser,
        user_metadata: {
          ...mockUser.user_metadata,
          full_name: cleanName
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }
  return mockUser
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfileName: (name: string) => Promise<void>
  switchRole: (role: 'worker' | 'cashier' | 'owner') => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateProfileName: async () => {},
  switchRole: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setSession(session)
          setUser(session.user)
        } else {
          setUser(getPersistedMockUser())
          setSession({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh",
            user: getPersistedMockUser(),
          })
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        setUser(getPersistedMockUser())
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Safety timeout: stop loading spinner after 1.5s in case of slow/blocked network
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session)
          setUser(session.user)
        } else {
          setUser(getPersistedMockUser())
          setSession({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh",
            user: getPersistedMockUser(),
          })
        }
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  // Auto redirection for the /login route if logged in
  useEffect(() => {
    if (loading) return

    if (user && pathname === "/login") {
      router.push("/orders")
    }
  }, [user, loading, pathname, router])

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/orders")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfileName = async (name: string) => {
    if (session && session.user && session.user.id !== "00000000-0000-0000-0000-000000000000") {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      })
      if (error) throw error
      if (data && data.user) {
        setUser(data.user)
      }
    } else {
      localStorage.setItem('ssg_mock_cashier_name', name)
      setUser(prev => {
        const baseUser = prev || getPersistedMockUser()
        return {
          ...baseUser,
          user_metadata: {
            ...baseUser.user_metadata,
            full_name: name
          }
        }
      })
    }
  }

  const switchRole = async (role: 'worker' | 'cashier' | 'owner') => {
    const names = {
      worker: "Rakesh",
      cashier: "Sumit",
      owner: "Divyansh"
    }
    const name = names[role]

    if (session && session.user && session.user.id !== "00000000-0000-0000-0000-000000000000") {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { 
            full_name: name,
            role: role
          }
        })
        if (error) throw error
        if (data && data.user) {
          setUser(data.user)
          toast.success(`Role updated to ${role.charAt(0).toUpperCase() + role.slice(1)}`)
        }
      } catch (err: any) {
        console.error("Failed to update role:", err)
        toast.error("Failed to update role in Supabase")
      }
    } else {
      localStorage.setItem('ssg_mock_cashier_role', role)
      localStorage.setItem('ssg_mock_cashier_name', name)
      setUser(prev => {
        const baseUser = prev || getPersistedMockUser()
        return {
          ...baseUser,
          user_metadata: {
            ...baseUser.user_metadata,
            full_name: name,
            role: role
          }
        }
      })
      toast.success(`Switched account to ${role.charAt(0).toUpperCase() + role.slice(1)}: ${name}`)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--pos-panel-2)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pos-brand)]"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user: user || getPersistedMockUser(), session, loading, signOut, updateProfileName, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
