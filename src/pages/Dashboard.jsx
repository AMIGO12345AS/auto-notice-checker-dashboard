import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Search, ChevronRight, Activity, Bell,
  LayoutGrid, List as ListIcon, AlignJustify,
  Filter, ArrowDownUp, AlertCircle, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // UI States
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list', 'compact'
  const [filterMode, setFilterMode] = useState('all') // 'all', 'unread', 'not_synced'
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'name', 'unread'

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*, notices(id, status)')

    if (error) {
      console.error('Error fetching clients:', error)
    } else {
      const processedClients = data.map(client => {
        const unreadCount = client.notices ? client.notices.filter(n => n.status === 'UNREAD').length : 0
        return { ...client, unreadCount }
      })
      setClients(processedClients)
    }
    setLoading(false)
  }

  // Data processing (Filter, Search, Sort)
  const processedData = useMemo(() => {
    let result = [...clients]

    // 1. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.gstin.toLowerCase().includes(term)
      )
    }

    // 2. Filter
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    if (filterMode === 'unread') {
      result = result.filter(c => c.unreadCount > 0)
    } else if (filterMode === 'not_synced') {
      result = result.filter(c => {
        if (!c.last_sync_date) return true
        return new Date(c.last_sync_date) < firstDayOfMonth
      })
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.last_sync_date ? new Date(a.last_sync_date).getTime() : 0
        const dateB = b.last_sync_date ? new Date(b.last_sync_date).getTime() : 0
        return dateB - dateA
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'unread') {
        return b.unreadCount - a.unreadCount
      }
      return 0
    })

    return result
  }, [clients, searchTerm, filterMode, sortBy])

  const formatDate = (dateString) => {
    if (!dateString) return 'Never synced'
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isSyncedThisMonth = (dateString) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  const totalUnread = clients.reduce((acc, curr) => acc + curr.unreadCount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            {clients.length} total clients
          </p>
        </div>

        {totalUnread > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
            <Bell className="h-4 w-4" />
            <span>{totalUnread} Unread Notices</span>
          </div>
        )}
      </div>

      {/* Toolbar (Search, Filters, Views) */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-20 z-40">

        {/* Search */}
        <div className="relative w-full lg:w-80 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-none bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Search clients, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          {/* Filters */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100 shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all font-medium", filterMode === 'all' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('unread')}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all font-medium flex items-center gap-1.5", filterMode === 'unread' ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700")}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Unread
            </button>
            <button
              onClick={() => setFilterMode('not_synced')}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all font-medium flex items-center gap-1.5", filterMode === 'not_synced' ? "bg-white shadow-sm text-amber-600" : "text-gray-500 hover:text-gray-700")}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Pending Sync
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 pl-3">
            <ArrowDownUp className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border-none text-gray-600 font-medium focus:ring-0 cursor-pointer pl-0 py-1"
            >
              <option value="recent">Recent Sync</option>
              <option value="name">Name (A-Z)</option>
              <option value="unread">Most Unread</option>
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 shrink-0 border-l border-gray-200 pl-3">
            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}>
              <ListIcon className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('compact')} className={cn("p-1.5 rounded-md transition-colors", viewMode === 'compact' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}>
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-black animate-spin" />
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <Search className="h-8 w-8 text-gray-300 mb-3" />
            <h3 className="text-base font-medium text-gray-900">No clients found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
            {(searchTerm || filterMode !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterMode('all') }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            <AnimatePresence>
              {processedData.map((client) => {
                const isSynced = isSyncedThisMonth(client.last_sync_date)

                // COMPACT VIEW
                if (viewMode === 'compact') {
                  return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={client.id}>
                      <Link to={`/client/${client.id}`} className="group flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                          {client.unreadCount > 0 ? (
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-transparent shrink-0" />
                          )}
                          <div className="flex gap-4 items-center min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate w-48">{client.name}</span>
                            <span className="text-xs text-gray-500 font-mono w-32">{client.gstin}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <span className={cn("text-xs", isSynced ? "text-gray-400" : "text-amber-600 font-medium")}>
                            {formatDate(client.last_sync_date)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                }

                // LIST VIEW
                if (viewMode === 'list') {
                  return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={client.id}>
                      <Link to={`/client/${client.id}`} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:border-gray-300 border border-gray-100 rounded-xl transition-all shadow-sm">
                        <div className="flex items-start sm:items-center gap-4 min-w-0 mb-3 sm:mb-0">
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                            {client.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate pr-4 group-hover:text-blue-600 transition-colors">
                              {client.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{client.gstin}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 w-full sm:w-auto">
                          <div className="flex flex-col sm:items-end gap-1">
                            {client.unreadCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">
                                {client.unreadCount} NEW NOTICES
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 invisible sm:visible">No new notices</span>
                            )}
                            <div className={cn("flex items-center gap-1 text-xs", isSynced ? "text-gray-400" : "text-amber-600 font-medium")}>
                              <Clock className="h-3 w-3" />
                              {formatDate(client.last_sync_date)}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600 hidden sm:block" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                }

                // GRID VIEW (Default)
                return (
                  <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={client.id}>
                    <Link to={`/client/${client.id}`} className="group flex flex-col h-full bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                          {client.name.substring(0, 1).toUpperCase()}
                        </div>
                        {client.unreadCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {client.unreadCount} NEW
                          </span>
                        )}
                      </div>

                      <div className="flex-1 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-mono mt-1.5">{client.gstin}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div className={cn("flex items-center gap-1.5 text-[11px]", isSynced ? "text-gray-400" : "text-amber-600 font-medium")}>
                          {isSynced ? <Clock className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          {formatDate(client.last_sync_date)}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
