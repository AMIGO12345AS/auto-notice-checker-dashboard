import { Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] selection:bg-blue-200">
      {/* Floating Modern Header */}
      <header className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <nav className="glass rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-3 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900 hidden sm:block">
              GST Notice Tracker
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleLogout}
              className="group flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area with Page Transitions */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
