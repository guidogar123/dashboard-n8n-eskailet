"use client"

import { useEffect, useState } from "react"
import { User, Mail, Lock, Shield, Loader2, Save, AlertCircle, CheckCircle } from "lucide-react"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    useEffect(() => {
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setFormData(prev => ({
                        ...prev,
                        name: data.user.name || "",
                        email: data.user.email || ""
                    }))
                }
                setLoading(false)
            })
            .catch(err => {
                console.error("Error loading profile:", err)
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus(null)

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: "Las contraseñas nuevas no coinciden" })
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus({ type: 'success', message: "Perfil actualizado correctamente" })
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }))
            } else {
                setStatus({ type: 'error', message: data.error || "Error al actualizar el perfil" })
            }
        } catch (error) {
            setStatus({ type: 'error', message: "Error de conexión con el servidor" })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
                    <User className="w-8 h-8 text-primary" />
                    Mi Perfil
                </h1>
                <p className="text-text-secondary">Gestiona tu información personal y credenciales de acceso</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card Summary */}
                <div className="glass-card p-8 h-fit text-center space-y-4 border-primary/20 bg-primary/5">
                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-background font-black text-4xl mx-auto shadow-xl shadow-primary/20">
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">{formData.name}</h2>
                        <p className="text-sm text-text-muted">{formData.email}</p>
                    </div>
                    <div className="pt-4">
                        <span className="px-3 py-1 bg-surface-glass border border-border rounded-full text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2">
                            <Shield className="w-3 h-3" />
                            Usuario Verificado
                        </span>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 border-border/50">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 mb-4">Información General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2 mb-4">Seguridad</h3>
                            <p className="text-xs text-text-muted mb-4 italic">Solo rellena estos campos si deseas cambiar tu contraseña actual.</p>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Contraseña Actual (Requerida para cambios)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="input-field pl-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="Nueva clave"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="Confirmar clave"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-scale-in ${status.type === 'success' ? 'bg-success/10 text-success border border-success/30' : 'bg-error/10 text-error border border-error/30'}`}>
                                {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <p className="text-sm font-bold">{status.message}</p>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Guardar Cambios del Perfil
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
