import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CheckCircle2, Clock, FileText, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientAndNotices()
  }, [id])

  const fetchClientAndNotices = async () => {
    setLoading(true)

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (!clientError) setClient(clientData)

    const { data: noticesData, error: noticesError } = await supabase
      .from('notices')
      .select('*')
      .eq('client_id', id)
      .order('date_issued', { ascending: false })

    if (!noticesError) {
      const sorted = [...noticesData].sort((a, b) => {
        if (a.status === 'UNREAD' && b.status !== 'UNREAD') return -1
        if (a.status !== 'UNREAD' && b.status === 'UNREAD') return 1
        return new Date(b.date_issued) - new Date(a.date_issued)
      })
      setNotices(sorted)
    }

    setLoading(false)
  }

  const markAsRead = async (noticeId) => {
    // Optimistic UI update with layout animation
    setNotices(current => {
      const updated = current.map(n =>
        n.id === noticeId ? { ...n, status: 'READ' } : n
      )
      return updated.sort((a, b) => {
        if (a.status === 'UNREAD' && b.status !== 'UNREAD') return -1
        if (a.status !== 'UNREAD' && b.status === 'UNREAD') return 1
        return new Date(b.date_issued) - new Date(a.date_issued)
      })
    })

    await supabase.from('notices').update({ status: 'READ' }).eq('id', noticeId)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
      </div>
    )
  }

  if (!client) return <div className="py-20 text-center text-xl font-bold text-gray-400">Client not found.</div>

  const unreadCount = notices.filter(n => n.status === 'UNREAD').length

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Modern Detail Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none" />

        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-black mb-8 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Dashboard</span>
        </Link>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold tracking-wider font-mono border border-gray-200">
                GSTIN: {client.gstin}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {client.name}
            </h1>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <Clock className="h-4 w-4" />
              <span>Synced {new Date(client.last_sync_date).toLocaleDateString()}</span>
            </div>
            {unreadCount > 0 && (
              <span className="text-sm font-bold text-red-500 px-4 py-1">
                {unreadCount} Unread Notice{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notices Timeline / Stack */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Notice History
          </h3>
          <span className="text-sm font-medium text-gray-500">{notices.length} Total</span>
        </div>

        {notices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
          >
            <p className="text-gray-500 font-medium text-lg">No notices found for this client.</p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {notices.map((notice) => {
                const isUnread = notice.status === 'UNREAD'

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={notice.id}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-6 transition-all duration-500 border",
                      isUnread
                        ? "bg-white border-red-100 shadow-[0_8px_30px_rgb(239,68,68,0.08)]"
                        : "bg-gray-50/50 border-gray-100 shadow-sm opacity-80 hover:opacity-100"
                    )}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-400" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 pl-2">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center flex-wrap gap-3">
                          {isUnread && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
                              ACTION REQUIRED
                            </span>
                          )}
                          <span className="inline-flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {new Date(notice.date_issued).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>

                        <h4 className={cn(
                          "text-lg sm:text-xl font-bold leading-tight",
                          isUnread ? "text-gray-900" : "text-gray-600"
                        )}>
                          {notice.title}
                        </h4>

                        <p className="text-sm font-medium text-gray-500 font-mono bg-white inline-block px-3 py-1 rounded-lg border border-gray-100">
                          ARN: {notice.arn}
                        </p>
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        {isUnread ? (
                          <button
                            onClick={() => markAsRead(notice.id)}
                            className="group relative inline-flex items-center justify-center space-x-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 hover:shadow-lg w-full sm:w-auto overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Acknowledge
                            </span>
                            {/* Hover slide effect */}
                            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                          </button>
                        ) : (
                          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100">
                            <Check className="h-4 w-4" />
                            <span>Acknowledged</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
