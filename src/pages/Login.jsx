import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldAlert, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fbfbfd] overflow-hidden px-4">
      {/* Abstract Animated Background Elements */}
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-20 h-[400px] w-[400px] rounded-full bg-purple-100/50 blur-3xl mix-blend-multiply"
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-emerald-50/50 blur-3xl mix-blend-multiply"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="glass rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-xl mb-6">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Sign in to manage your GST notices securely.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group relative flex w-full items-center justify-center space-x-2 rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
                loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-black/20"
              )}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
