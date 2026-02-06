"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, Trash2, Mail, Shield, ShieldCheck, Loader2, Settings, Activity, MessageSquare, AlertCircle, Database } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface User {
    id: string
    name: string
    email: string
    role: string
    lastLogin: string | null
}

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [loadingSeed, setLoadingSeed] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "VIEWER"
    })
    const [error, setError] = useState("")

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users")
            const data = await res.json()
            if (res.ok) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                setUsers([data.user, ...users])
                setShowForm(false)
                setFormData({ name: "", email: "", password: "", role: "VIEWER" })
            } else {
                setError(data.error || "Ocurrió un error")
            }
        } catch (error) {
            setError("Error de conexión")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id))
            } else {
                const data = await res.json()
                alert(data.error || "Error al eliminar")
            }
        } catch (error) {
            alert("Error de conexión")
        }
    }
    const handleSeedData = async () => {
        if (!confirm("Esto cargará registros de prueba realistas para los gráficos. ¿Continuar?")) return
        setLoadingSeed(true)
        try {
            const res = await fetch("/api/maintenance/seed", { method: "POST" })
            if (res.ok) {
                alert("¡Datos demo cargados! Recargando para ver los cambios...")
                window.location.reload()
            } else {
                alert("Error al cargar datos")
            }
        } catch (error) {
            alert("Error de conexión")
        } finally {
            setLoadingSeed(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
                        <Settings className="w-8 h-8 text-secondary" />
                        Configuración
                    </h1>
                    <p className="text-text-secondary">Gestión de usuarios y permisos del sistema</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    {showForm ? "Cancelar" : "Nuevo Usuario"}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 animate-scale-in border-primary/30">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Añadir Nuevo Miembro
                    </h2>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input-field w-full"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input-field w-full"
                                placeholder="juan@empresa.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="input-field w-full"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Rol</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="input-field w-full bg-surface"
                            >
                                <option value="VIEWER">Visualizador</option>
                                <option value="EDITOR">Editor</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between">
                            {error && <p className="text-error text-sm font-medium">{error}</p>}
                            <div className="flex-1"></div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary px-8"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Último Acceso</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-surface/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-text-primary">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3 opacity-50" />
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {u.role === "ADMIN" ? (
                                            <span className="flex items-center gap-1.5 text-accent font-bold">
                                                <ShieldCheck className="w-4 h-4" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-text-muted">
                                                <Shield className="w-4 h-4" />
                                                {u.role === "EDITOR" ? "Editor" : "Visualizador"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                        {u.lastLogin ? formatDate(u.lastLogin) : "Nunca"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Eliminar usuario"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Maintenance Section */}
            <div className="pt-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-error/10 rounded-xl">
                        <Trash2 className="w-6 h-6 text-error" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-0.5">Mantenimiento y Limpieza</h2>
                        <p className="text-text-secondary text-sm">Borra datos antiguos o de demostración para empezar de cero</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-error/20 flex flex-col justify-between hover:border-error/40 transition-all">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-error font-black text-xs uppercase tracking-widest">
                                <Activity className="w-4 h-4" />
                                Purgar Ejecuciones
                            </div>
                            <p className="text-xs text-text-secondary italic">
                                Elimina el historial técnico de n8n para liberar espacio. Esta acción es irreversible.
                            </p>
                            <div className="flex items-center gap-4">
                                <select id="exec-days" className="bg-[#0f172a] border border-border/50 rounded-xl py-2 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-error/50 flex-1 appearance-none">
                                    <option value="30">Más de 30 días</option>
                                    <option value="60">Más de 60 días</option>
                                    <option value="90">Más de 90 días</option>
                                    <option value="1">Más de 24 horas (Test)</option>
                                </select>
                                <button
                                    onClick={async () => {
                                        const days = (document.getElementById('exec-days') as HTMLSelectElement).value;
                                        if (!confirm(`¿Borrar ejecuciones de más de ${days} días?`)) return;
                                        const res = await fetch('/api/maintenance/clean', {
                                            method: 'POST',
                                            body: JSON.stringify({ type: 'executions', days })
                                        });
                                        const data = await res.json();
                                        alert(`Limpieza terminada: ${data.deletedExecutions} registros eliminados.`);
                                        window.location.reload();
                                    }}
                                    className="btn-secondary text-error hover:bg-error/10 border-error/20 px-6 text-xs font-bold"
                                >
                                    Purgar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-accent/20 flex flex-col justify-between hover:border-accent/40 transition-all">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
                                <MessageSquare className="w-4 h-4" />
                                Purgar FAQs antiguas
                            </div>
                            <p className="text-xs text-text-secondary italic">
                                Limpia el historial de consultas para refrescar las tendencias de tus agentes.
                            </p>
                            <div className="flex items-center gap-4">
                                <select id="faq-days" className="bg-[#0f172a] border border-border/50 rounded-xl py-2 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-accent/50 flex-1 appearance-none">
                                    <option value="30">Más de 30 días</option>
                                    <option value="60">Más de 60 días</option>
                                    <option value="90">Más de 90 días</option>
                                    <option value="1">Más de 24 horas (Test)</option>
                                </select>
                                <button
                                    onClick={async () => {
                                        const days = (document.getElementById('faq-days') as HTMLSelectElement).value;
                                        if (!confirm(`¿Borrar consultas de más de ${days} días?`)) return;
                                        const res = await fetch('/api/maintenance/clean', {
                                            method: 'POST',
                                            body: JSON.stringify({ type: 'faqs', days })
                                        });
                                        const data = await res.json();
                                        alert(`Limpieza terminada: ${data.deletedFaqs} registros eliminados.`);
                                        window.location.reload();
                                    }}
                                    className="btn-secondary text-accent hover:bg-accent/10 border-accent/20 px-6 text-xs font-bold"
                                >
                                    Purgar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Data Section */}
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Cargar Datos Demo
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Genera instantáneamente cientos de registros para que los gráficos del dashboard se vean impresionantes.
                        </p>
                    </div>
                    <button
                        onClick={handleSeedData}
                        disabled={loadingSeed}
                        className="bg-primary text-background font-black px-8 py-3 rounded-xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap"
                    >
                        {loadingSeed ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                        CARGAR DEMO
                    </button>
                </div>

                {/* Factory Reset Section */}
                <div className="mt-8 p-6 bg-error/5 border border-error/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-error flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Reset de Fábrica (Limpiar Demo)
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Borra ABSOLUTAMENTE TODAS las ejecuciones, leads y FAQs. Úsalo para eliminar los datos demo antes de conectar tus propios agentes.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            if (!confirm("⚠️ ADVERTENCIA: Se borrarán TODOS los datos (ejecuciones, leads y consultas). Esto no se puede deshacer. ¿Continuar?")) return;
                            const res = await fetch('/api/maintenance/clean', {
                                method: 'POST',
                                body: JSON.stringify({ type: 'factory-reset' })
                            });
                            const data = await res.json();
                            alert(`Sistema reseteado: Se han eliminado ${data.deletedExecutions} ejecuciones, ${data.deletedLeads} leads y ${data.deletedFaqs} consultas.`);
                            window.location.reload();
                        }}
                        className="bg-error text-white font-black px-8 py-3 rounded-xl hover:bg-error/80 transition-all shadow-lg shadow-error/20 text-sm"
                    >
                        RESET TOTAL
                    </button>
                </div>
            </div>
        </div>
    )
}
