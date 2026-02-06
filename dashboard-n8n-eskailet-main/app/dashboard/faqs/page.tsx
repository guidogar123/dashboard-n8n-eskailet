"use client"

import { useEffect, useState } from "react"
import { MessageSquare, TrendingUp, Calendar, User, Search, X } from "lucide-react"

interface Faq {
    id: string
    question: string
    frequency: number
    category: string | null
    date: string
    agentName: string | null
}

export default function FaqsPage() {
    const [faqs, setFaqs] = useState<Faq[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [agentFilter, setAgentFilter] = useState("")

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true)
            try {
                let url = "/api/faqs?"
                if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`
                if (agentFilter) url += `agentName=${encodeURIComponent(agentFilter)}`

                const res = await fetch(url)
                const data = await res.json()
                setFaqs(data.faqs || [])
            } catch (error) {
                console.error("Error loading FAQs:", error)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchFaqs()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, agentFilter])

    if (loading && !searchTerm && !agentFilter) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        Análisis de Consultas
                    </h1>
                    <p className="text-text-secondary">Detección automática de tendencias y preguntas frecuentes</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar consulta..."
                            className="w-full bg-[#0f172a] border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg shadow-black/5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={agentFilter}
                            onChange={(e) => setAgentFilter(e.target.value)}
                            className="bg-[#0f172a] border border-border/50 rounded-xl py-2 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 appearance-none min-w-[150px] font-bold cursor-pointer transition-all hover:border-primary/30"
                        >
                            <option value="">Todos los agentes</option>
                            <option value="Agente 1">Agente 1</option>
                            <option value="Agente Ventas">Agente Ventas</option>
                        </select>
                    </div>

                    {(searchTerm || agentFilter) && (
                        <button
                            onClick={() => { setSearchTerm(""); setAgentFilter(""); }}
                            className="p-2 bg-error/10 text-error rounded-xl border border-error/20 hover:bg-error/20 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <TrendingUp className="w-8 h-8 text-primary animate-bounce" />
                    </div>
                )}
                {faqs.length > 0 ? (
                    faqs.map((faq, index) => (
                        <div key={faq.id} className="glass-card p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="flex items-start gap-6">
                                <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border/50 group-hover:bg-primary/10 transition-colors">
                                    <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">Top</span>
                                    <span className="text-2xl font-black text-text-primary group-hover:text-primary transition-colors">{index + 1}</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-text-primary leading-tight">
                                                {faq.question}
                                            </p>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-surface px-2 py-1 rounded-md">
                                                    <Calendar className="w-3 h-3 text-primary" />
                                                    {new Date(faq.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-surface px-2 py-1 rounded-md">
                                                    <User className="w-3 h-3 text-secondary" />
                                                    {faq.agentName || "Global"}
                                                </div>
                                                {faq.category && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-md ring-1 ring-accent/20">
                                                        {faq.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xl font-black">{faq.frequency}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">veces</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card py-24 text-center space-y-4">
                        <MessageSquare className="w-16 h-16 text-text-muted mx-auto opacity-10" />
                        <p className="text-text-muted italic">No se han encontrado consultas con los filtros actuales</p>
                    </div>
                )}
            </div>
        </div>
    )
}
