"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { KeyRound, Mail, Sparkles, Loader2, UserPlus, LogIn, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("owner")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!username || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    if (username.includes("@")) {
      setError("Username should not contain '@' symbol.")
      setLoading(false)
      return
    }

    // Map username internally to a mock email for Supabase Auth
    const email = `${username.trim().toLowerCase()}@pos.com`

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || username,
              username: username.trim().toLowerCase(),
              role: role
            },
          },
        })

        if (error) throw error

        setMessage("Account created successfully! Logging you in...")
        // Wait a brief moment for state changes
        setTimeout(() => {
          router.push("/orders")
        }, 1000)
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push("/orders")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--pos-panel-2)] p-4 relative overflow-hidden">
      {/* Decorative Mint Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--pos-brand)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--pos-brand)]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card (Styled with POS colors) */}
      <div className="w-full max-w-md pos-panel backdrop-blur-xl bg-[var(--pos-panel)]/80 border border-[var(--pos-stroke)] rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-[var(--pos-brand)] flex items-center justify-center shadow-lg shadow-[var(--pos-brand)]/20 mb-4">
            <Sparkles className="h-6 w-6 text-black font-bold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            SSG Store POS
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {isSignUp ? "Register a new profile to manage your store" : "Sign in to access your point of sale"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 text-sm text-center shadow-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm text-center shadow-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <label htmlFor="login-fullname" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block cursor-pointer">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                    <UserPlus className="h-5 w-5" />
                  </span>
                  <input
                    id="login-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="login-role" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block cursor-pointer">
                  Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                    <Shield className="h-5 w-5" />
                  </span>
                  <input
                    id="login-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    placeholder="e.g. Owner, Cashier, Manager"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="login-username" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block cursor-pointer">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                placeholder="krish / vipin / admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block cursor-pointer">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--pos-brand)] hover:opacity-90 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[var(--pos-brand)]/10 disabled:opacity-50 disabled:cursor-not-allowed mt-8 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" /> Create Profile
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" /> Access POS
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have a profile?" : "Need a new profile?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            className="text-[var(--pos-brand)] hover:underline font-medium focus:outline-none"
          >
            {isSignUp ? "Sign In" : "Register"}
          </button>
        </div>
      </div>
    </div>
  )
}

