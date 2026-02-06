"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"
import { User, Phone, Mail, Calendar, MessageSquare, Search, Filter, ArrowUpDown, X } from "lucide-react"

interface Lead {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    source: string | null
    summary: string | null
    date: string
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Filtros
    const [searchTerm, setSearchTerm] = useState("")
    const [sourceFilter, setSourceFilter] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isFilterVisible, setIsFilterVisible] = useState(false)

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true)
            try {
                let url = `/api/leads?page=${page}&limit=50`
                if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
                if (sourceFilter) url += `&source=${encodeURIComponent(sourceFilter)}`
                if (startDate) url += `&startDate=${startDate}`
                if (endDate) url += `&endDate=${endDate}`

                const res = await fetch(url)
                const data = await res.json()
                setLeads(data.leads || [])
                setTotalPages(data.pagination?.totalPages || 1)
            } catch (error) {
                console.error("Error loading leads:", error)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchLeads()
        }, 500)

        return () => clearTimeout(timer)
    }, [page, searchTerm, sourceFilter, startDate, endDate])

    const resetFilters = () => {
        setSearchTerm("")
        setSourceFilter("")
        setStartDate("")
        setEndDate("")
    }

    if (loading && page === 1 && !searchTerm && !sourceFilter && !startDate && !endDate) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-text-secondary animate-pulse">Cargando base de contactos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10 px-2 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-accent/20 rounded-xl">
                            <User className="w-6 h-6 text-accent" />
                        </div>
                        CRM de Leads
                    </h1>
                    <p className="text-text-secondary text-sm">Gestiona los clientes potenciales capturados por tus agentes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Nombre, email o teléfono..."
                            className="input-field pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${isFilterVisible ? 'bg-accent/20 border-accent text-accent' : 'bg-[#0f172a] border-border/50 text-text-secondary hover:border-accent/30'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>

                        {(searchTerm || sourceFilter || startDate || endDate) && (
                            <button
                                onClick={resetFilters}
                                className="p-2.5 bg-error/10 text-error rounded-xl border border-error/20 hover:bg-error/20 transition-all"
                                title="Limpiar filtros"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Panel de Filtros Avanzado */}
            {isFilterVisible && (
                <div className="glass-card p-6 border-accent/20 animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Agente</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Nombre del agente..."
                                value={sourceFilter}
                                onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
                                className="input-field pl-10 w-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Desde</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="input-field pl-10 w-full [color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Hasta</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="input-field pl-10 w-full [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden border-border/40 shadow-2xl relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <ArrowUpDown className="w-6 h-6 text-accent animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-surface/60 border-b border-border/60">
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Nombre del Lead</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Contacto</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Capturado por (Agente)</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Fecha Captura</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Resumen de Interés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-accent/5 transition-all group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold border border-accent/20">
                                                    {lead.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <span className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                                                    {lead.name || "Identidad desconocida"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-text-secondary truncate max-w-[200px]">
                                                    <Mail className="w-3 h-3 text-primary shrink-0" />
                                                    {lead.email || "Sin email"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                                    <Phone className="w-3 h-3 text-success shrink-0" />
                                                    {lead.phone || "Sin teléfono"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black bg-surface-glass border border-border/50 text-text-muted group-hover:border-accent/40 group-hover:text-accent transition-all">
                                                {lead.source || "WEB"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-text-primary">{new Date(lead.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                                <span className="text-[10px] text-text-muted">{new Date(lead.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="flex gap-2">
                                                <MessageSquare className="w-4 h-4 text-accent/40 shrink-0 mt-0.5" />
                                                <p className="text-xs text-text-secondary line-clamp-2 italic">
                                                    {lead.summary || "No hay resumen disponible para este contacto."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Search className="w-12 h-12 text-text-muted" />
                                            <p className="text-lg font-medium">No hay registros que coincidan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border/50 bg-background/30 flex items-center justify-between">
                        <div className="text-xs text-text-muted">
                            Página <span className="text-text-primary font-bold">{page}</span> de {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 hover:bg-surface rounded-lg disabled:opacity-10 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4 rotate-90" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 hover:bg-surface rounded-lg disabled:opacity-10 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4 -rotate-90" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
