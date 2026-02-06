"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate, formatDuration, formatNumber } from "@/lib/utils"
import { Activity, Terminal, Clock, Cpu, Wallet, AlertCircle, CheckCircle, Search, Filter, X, Calendar } from "lucide-react"

interface Execution {
    id: string
    agentName: string
    n8nExecutionId: string
    status: 'SUCCESS' | 'ERROR'
    startedAt: string
    endedAt: string | null
    durationSeconds: number | null
    modelUsed: string | null
    totalTokens: number | null
    costUsd: number | null
}

export default function ExecutionsPage() {
    const [executions, setExecutions] = useState<Execution[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Filtros
    const [agentFilter, setAgentFilter] = useState("")
    const [modelFilter, setModelFilter] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isFilterVisible, setIsFilterVisible] = useState(false)

    useEffect(() => {
        const fetchExecutions = async () => {
            setLoading(true)
            try {
                let url = `/api/executions?page=${page}&limit=50`
                if (agentFilter) url += `&agentName=${encodeURIComponent(agentFilter)}`
                if (modelFilter) url += `&modelUsed=${encodeURIComponent(modelFilter)}`
                if (startDate) url += `&startDate=${startDate}`
                if (endDate) url += `&endDate=${endDate}`

                const res = await fetch(url)
                const data = await res.json()
                setExecutions(data.executions || [])
                setTotalPages(data.pagination?.totalPages || 1)
            } catch (error) {
                console.error("Error loading executions:", error)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchExecutions()
        }, 500) // Debounce para no saturar al escribir

        return () => clearTimeout(timer)
    }, [page, agentFilter, modelFilter, startDate, endDate])

    const resetFilters = () => {
        setAgentFilter("")
        setModelFilter("")
        setStartDate("")
        setEndDate("")
    }

    if (loading && page === 1 && !agentFilter && !modelFilter) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-10 h-10 text-primary animate-pulse" />
                    <p className="text-text-secondary font-medium">Cargando ejecuciones...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1 flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-primary" />
                        Historial de Ejecuciones
                    </h1>
                    <p className="text-text-secondary">Registro técnico directo de tus agentes en n8n</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isFilterVisible ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    {(agentFilter || modelFilter || startDate || endDate) && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all text-sm font-bold"
                        >
                            <X className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Panel de Filtros */}
            {isFilterVisible && (
                <div className="glass-card p-6 border-primary/20 animate-slide-up grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Agente</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Nombre del agente..."
                                value={agentFilter}
                                onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
                                className="w-full bg-[#0f172a] border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Modelo</label>
                        <select
                            value={modelFilter}
                            onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
                            className="w-full bg-[#0f172a] border border-border/50 rounded-xl py-2 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                        >
                            <option value="">Todos los modelos</option>
                            <option value="gpt-5-mini">GPT-5 Mini</option>
                            <option value="gpt-5-nano">GPT-5 Nano</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4o-mini">GPT-4o-mini</option>
                            <option value="claude-3-sonnet">Claude 3.5 Sonnet</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Desde</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="w-full bg-[#0f172a] border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
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
                                className="w-full bg-[#0f172a] border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden border-border/50 italic">
                {loading && page > 1 && (
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead className="bg-surface/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">ID Ejecución</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Fecha y Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Agente (Workflow)</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Recursos</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Inversión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {executions.length > 0 ? (
                                executions.map((exec) => (
                                    <tr key={exec.id} className="hover:bg-surface/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                                                <span className="text-xs font-mono text-text-primary bg-background/50 px-2 py-1 rounded border border-border/30">
                                                    #{exec.n8nExecutionId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-text-primary">{formatDate(exec.startedAt)}</span>
                                                <span className="text-[10px] flex items-center gap-1 font-bold opacity-60">
                                                    <Clock className="w-3 h-3" />
                                                    {exec.durationSeconds ? formatDuration(exec.durationSeconds) : "Completado"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="font-bold text-text-primary">{exec.agentName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {exec.status === 'SUCCESS' ? (
                                                <span className="flex items-center gap-1.5 text-success font-bold text-[10px] uppercase">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Éxito
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-error font-bold text-[10px] uppercase">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Fallo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-black uppercase w-fit tracking-wider">
                                                    {exec.modelUsed || "N/A"}
                                                </span>
                                                <span className="text-[10px] text-text-muted flex items-center gap-1 font-bold">
                                                    <Cpu className="w-3 h-3" />
                                                    {exec.totalTokens ? formatNumber(exec.totalTokens) : "0"} tokens
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-1 font-black text-primary">
                                                <Wallet className="w-3 h-3" />
                                                {formatCurrency(Number(exec.costUsd || 0), 4)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <p className="text-text-muted opacity-50 font-bold italic">No se encontraron ejecuciones con los filtros aplicados</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-6 border-t border-border flex items-center justify-between bg-surface/20">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn-secondary text-xs disabled:opacity-30 flex items-center gap-2"
                        >
                            Anterior
                        </button>
                        <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="text-primary font-bold">{page}</span>
                            <span className="text-text-muted">/</span>
                            <span>{totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn-secondary text-xs disabled:opacity-30 flex items-center gap-2"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
