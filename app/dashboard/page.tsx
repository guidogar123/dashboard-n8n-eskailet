"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    Activity,
    CheckCircle,
    Users,
    TrendingUp,
    Calendar,
    Bot,
    Loader2
} from "lucide-react"

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState("30d")
    const [customStartDate, setCustomStartDate] = useState("")
    const [customEndDate, setCustomEndDate] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true)
            setError(null)
            try {
                // Cálculo de fechas basado en dateRange
                const now = new Date()
                let from = new Date()
                let to = new Date()

                if (dateRange === '24h') {
                    from.setHours(0, 0, 0, 0)
                    to.setHours(23, 59, 59, 999)
                } else if (dateRange === '7d') {
                    from.setDate(now.getDate() - 7)
                } else if (dateRange === '30d') {
                    from.setDate(now.getDate() - 30)
                } else if (dateRange === 'custom' && customStartDate && customEndDate) {
                    from = new Date(customStartDate)
                    to = new Date(customEndDate)
                } else {
                    // Fallback to 30d
                    from.setDate(now.getDate() - 30)
                }

                const response = await fetch(`/api/metrics?from=${from.toISOString()}&to=${to.toISOString()}`)
                if (!response.ok) throw new Error('Error al cargar métricas')
                const result = await response.json()
                setData(result)
            } catch (err: any) {
                console.error(err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetrics()
    }, [dateRange, customStartDate, customEndDate])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando datos reales...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-xs">
                    Error: {error || 'No se pudieron cargar los datos'}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-colors uppercase tracking-widest"
                >
                    Reintentar Conexión
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Eskailet n8n <span className="text-primary drop-shadow-[0_0_10px_rgba(218,230,137,0.3)]">Panel de Control</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Rendimiento técnico y analítica de inversión</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
                        {['24h', '7d', '30d'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setDateRange(period)}
                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 tracking-widest ${dateRange === period
                                    ? 'bg-primary text-slate-950 shadow-[0_0_15px_rgba(218,230,137,0.3)]'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {period === '24h' ? 'HOY' : `${period.toUpperCase()}`}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase px-1">Desde</label>
                            <input
                                type="date"
                                value={customStartDate}
                                className="bg-transparent text-white text-[10px] font-black p-1 outline-none uppercase tracking-widest border-b border-white/10"
                                onChange={(e) => {
                                    setCustomStartDate(e.target.value)
                                    setDateRange('custom')
                                }}
                            />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase px-1">Hasta</label>
                            <input
                                type="date"
                                value={customEndDate}
                                className="bg-transparent text-white text-[10px] font-black p-1 outline-none uppercase tracking-widest border-b border-white/10"
                                onChange={(e) => {
                                    setCustomEndDate(e.target.value)
                                    setDateRange('custom')
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Inversión */}
                <div className="card-standard group hover:border-primary/40 transition-all duration-500 bg-slate-900/40 border-white/5 p-8 rounded-3xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                            <DollarSign className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-primary text-[10px] font-black bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                            <TrendingUp className="w-3 h-3" />
                            {data.costChange >= 0 ? '+' : ''}{data.costChange.toFixed(1)}%
                        </div>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Inversión Estimada</p>
                    <h3 className="text-4xl font-black text-white px-1 tracking-tighter">${data.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>

                {/* Ejecuciones */}
                <div className="card-standard group hover:border-primary/40 transition-all duration-500 bg-slate-900/40 border-white/5 p-8 rounded-3xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                            <Activity className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-slate-400 text-[10px] font-black bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">General</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Ejecuciones Totales</p>
                    <h3 className="text-4xl font-black text-white px-1 tracking-tighter">{data.totalExecutions}</h3>
                </div>

                {/* Tasa de Éxito */}
                <div className="card-standard group hover:border-primary/40 transition-all duration-500 bg-slate-900/40 border-white/5 p-8 rounded-3xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                            <CheckCircle className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-primary text-[10px] font-black bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 uppercase tracking-widest">Efectividad</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Tasa de Éxito</p>
                    <h3 className="text-4xl font-black text-white px-1 tracking-tighter">{data.successRate.toFixed(1)}<span className="text-primary text-2xl ml-1">%</span></h3>
                </div>

                {/* Leads */}
                <div className="card-standard group hover:border-primary/40 transition-all duration-500 bg-slate-900/40 border-white/5 p-8 rounded-3xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                            <Users className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-primary text-[10px] font-black bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                            {data.leadsChange >= 0 ? '+' : ''}{data.leadsChange.toFixed(1)}%
                        </div>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Leads Generados</p>
                    <h3 className="text-4xl font-black text-white px-1 tracking-tighter">{data.newLeads}</h3>
                </div>
            </div>

            {/* Análisis y Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consumo de Tokens (Inversión Diaria) */}
                <div className="lg:col-span-2 card-standard bg-slate-900/40 border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Evolución de Inversión</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Coste diario de tokens & actividad</p>
                        </div>
                    </div>

                    {/* El Gráfico */}
                    <div className="w-full flex flex-col gap-6">
                        <div className="h-80 w-full bg-slate-950/40 rounded-[2rem] border border-white/5 flex items-end justify-between gap-1 md:gap-3 p-8 pb-6 relative group/chart">
                            {data.timeline && data.timeline.length > 0 ? (
                                data.timeline.map((item: any, i: number) => {
                                    const allCosts = data.timeline.map((t: any) => t.total_cost || 0)
                                    const avgCost = allCosts.length > 0 ? allCosts.reduce((a: any, b: any) => a + b, 0) / allCosts.length : 0.01
                                    const rawMaxCost = Math.max(...allCosts) || 0.01
                                    const effectiveMax = rawMaxCost > avgCost * 4 ? avgCost * 4 : rawMaxCost

                                    const valCost = item.total_cost || 0
                                    let height = 0
                                    if (valCost > 0) {
                                        height = Math.min(Math.pow(valCost / effectiveMax, 0.45) * 100, 100)
                                    }
                                    const finalHeight = Math.max(height, valCost > 0 ? 15 : 0)

                                    // Fecha (DD)
                                    const day = item.date ? item.date.split('-')[2] : '--'

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group/bar">
                                            {/* El contenedor de la barra */}
                                            <div className="w-full bg-white/5 rounded-t-xl relative h-full max-h-[100%] flex items-end overflow-hidden mb-1">
                                                <div
                                                    style={{ height: `${finalHeight}%` }}
                                                    className="w-full bg-primary rounded-t-xl shadow-[0_0_15px_rgba(218,230,137,0.4)] transition-all duration-700 ease-out group-hover/bar:brightness-110"
                                                />
                                            </div>

                                            {/* Fecha abajo */}
                                            <span className="text-[10px] font-black text-slate-600 group-hover/bar:text-primary transition-colors cursor-default">
                                                {day}
                                            </span>

                                            {/* Tooltip Float UI */}
                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 scale-90 group-hover/bar:scale-100">
                                                <div className="bg-slate-950/90 backdrop-blur-md border border-primary/30 px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap flex flex-col items-center gap-0.5">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                                                        {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-sm font-black text-white leading-none">
                                                        ${valCost.toFixed(3)}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/10 w-full justify-center">
                                                        <span className="text-[9px] text-primary font-bold">{(item.total_tokens || 0).toLocaleString()} <span className="text-slate-500">tkn</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-2">
                                    <Activity className="w-10 h-10 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin datos históricos</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Métricas */}
                <div className="card-standard bg-slate-900/40 border-white/5 p-10 rounded-[2.5rem] flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest">Resumen de Costes</h3>

                    <div className="space-y-6 flex-1">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Inversión Total</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                <span className="text-xs font-bold text-slate-600 uppercase">USD</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Media / Ejecución</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-primary">${data.totalExecutions > 0 ? (data.totalCost / data.totalExecutions).toFixed(4) : '0.000'}</span>
                                <span className="text-xs font-bold text-primary/40 uppercase">USD</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Red</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Activo</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periodo</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{new Date().toLocaleString('es-ES', { month: 'long' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rendimiento por Agente & Modelos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Agentes */}
                <div className="card-standard bg-slate-900/40 border-white/5 p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Inversión por Agente</h3>
                    </div>

                    <div className="space-y-4">
                        {data.executionsByAgent.length > 0 ? (
                            data.executionsByAgent.map((agent: any) => (
                                <div key={agent.agentName} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white group-hover:text-primary transition-colors">{agent.agentName}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{agent.count} Ejecuciones</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white tracking-tighter">${agent.totalCost.toFixed(3)}</span>
                                        <p className="text-[10px] text-primary font-black tracking-widest uppercase mt-0.5">USD</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 text-[10px] font-black uppercase text-center py-10 tracking-[0.2em]">Sin actividad de agentes</p>
                        )}
                    </div>
                </div>

                {/* Modelos */}
                <div className="card-standard bg-slate-900/40 border-white/5 p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Distribución de Modelos</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {data.modelDistribution.length > 0 ? (
                            data.modelDistribution.map((m: any) => {
                                const percent = (m.count / data.totalExecutions * 100).toFixed(0)
                                return (
                                    <div key={m.name} className="p-6 rounded-[2rem] bg-white/2 border border-white/5 text-center group hover:border-primary/30 transition-colors">
                                        <p className="text-3xl font-black text-white mb-1 group-hover:text-primary transition-colors">{percent}%</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.name}</p>
                                        <div className="h-1 w-12 bg-primary/20 mx-auto mt-4 rounded-full group-hover:bg-primary transition-colors" />
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-2 text-center py-10 opacity-20">
                                <p className="text-[10px] font-black uppercase tracking-widest">Sin datos de modelos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="flex justify-between mt-12 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <span>Status: Online</span>
                <span>System Analytics v10.2</span>
                <span>Auto-refresh Active</span>
            </div>
        </div>
    )
}

