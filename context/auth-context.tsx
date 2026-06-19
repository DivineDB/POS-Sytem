"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

const mockUser: User = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "guest@ssgstore.com",
  app_metadata: {},
  user_metadata: {
    full_name: "Admin Cashier",
    role: "owner"
  },
  aud: "authenticated",
  created_at: new Date().toISOString()
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
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
          setUser(mockUser)
          setSession({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh",
            user: mockUser,
          })
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        setUser(mockUser)
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
          setUser(mockUser)
          setSession({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh",
            user: mockUser,
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Guard: login page bypassed, we render children directly
  return (
    <AuthContext.Provider value={{ user: user || mockUser, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
