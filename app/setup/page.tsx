"use client"

import { useState } from "react"
import { Rocket, ShieldCheck, Database, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function SetupPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")
    const [diagnostics, setDiagnostics] = useState<any>(null)
    const [secret, setSecret] = useState("")

    const handleSetup = async (force = false) => {
        if (!secret) {
            setStatus("error")
            setMessage("Por favor, introduce el código de seguridad (CRON_SECRET).")
            return
        }
        setStatus("loading")
        setMessage(force ? "Aplicando actualización estructural..." : "Iniciando configuración de la base de datos...")

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret, force })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus("success")
                setMessage(force ? "¡Sincronización completada con éxito!" : "¡Configuración completada con éxito!")
                setDiagnostics(data.diagnostics)
            } else if (res.status === 403 && data.error === "ALREADY_INITIALIZED") {
                setStatus("error")
                setMessage("ALREADY_INITIALIZED")
            } else {
                setStatus("error")
                setMessage(data.error || data.message || "Ocurrió un error inesperado")
                console.error(data)
            }
        } catch (error: any) {
            setStatus("error")
            setMessage("Error de red o servidor: " + error.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="glass-card-glow p-8 w-full max-w-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4">
                        <Rocket className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Instalación Inicial</h1>
                    <div className="flex justify-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase tracking-widest border border-primary/30">
                            Versión 6.0 "Plug & Play"
                        </span>
                    </div>
                    <p className="text-text-secondary text-lg">
                        AI Agents Dashboard - Panel de Control
                    </p>
                </div>

                {status === "idle" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-surface/50 border border-border rounded-xl flex gap-3">
                                <Database className="w-5 h-5 text-secondary flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Base de Datos</h3>
                                    <p className="text-xs text-text-muted">Se aplicarán las migraciones de PostgreSQL.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-surface/50 border border-border rounded-xl flex gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Seguridad</h3>
                                    <p className="text-xs text-text-muted">Se creará el usuario administrador por defecto.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text-secondary">
                                Cron Secret (Verificación)
                            </label>
                            <input
                                type="password"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                className="input-field w-full"
                                placeholder="Ingresa tu secret..."
                            />
                        </div>

                        <button
                            onClick={() => handleSetup(false)}
                            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                            Comenzar Instalación
                        </button>
                    </div>
                )}

                {status === "loading" && (
                    <div className="text-center py-12 space-y-6">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <div>
                            <p className="text-xl font-semibold text-text-primary mb-2">{message}</p>
                            <p className="text-sm text-text-muted animate-pulse">
                                Esto puede tardar hasta 1 minuto mientras se configuran las tablas...
                            </p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center py-8 space-y-8 animate-scale-in">
                        <div className="inline-flex p-4 bg-success/10 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-success" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">{message}</h2>
                            <p className="text-text-secondary">
                                Ya puedes acceder al sistema con las credenciales configuradas.
                            </p>
                        </div>

                        {diagnostics && (
                            <div className="p-6 bg-surface border border-success/30 rounded-2xl text-left space-y-2">
                                <h3 className="text-sm font-bold text-success uppercase tracking-wider mb-3">Resumen de Instalación</h3>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Usuarios creados:</span>
                                    <span className="text-text-primary font-mono">{diagnostics.totalUsers}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Admin creado:</span>
                                    <span className="text-success font-bold">{diagnostics.adminExists ? "Sí" : "No"}</span>
                                </div>
                            </div>
                        )}

                        <a
                            href="/login"
                            className="btn-primary w-full py-4 font-bold inline-block decoration-transparent"
                        >
                            Ir al Login
                        </a>
                    </div>
                )}

                {status === "error" && message === "ALREADY_INITIALIZED" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-text-primary">Sistema ya Inicializado</h2>
                                <p className="text-sm text-text-secondary mt-1">
                                    El bloqueo de seguridad ha evitado una reinstalación accidental.
                                    Sin embargo, si estás instalando una **actualización (como la v4.1)**,
                                    puedes forzar la sincronización del esquema sin perder tus datos.
                                </p>
                            </div>
                        </div>

                        <div className="bg-surface/50 p-4 rounded-xl border border-border italic text-xs text-text-muted">
                            Aviso: Forzar la actualización sincronizará las nuevas estructuras de la v6.0.
                        </div>

                        <button
                            onClick={() => handleSetup(true)}
                            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                            Forzar Sincronización v6.0
                        </button>

                        <button
                            onClick={() => window.location.href = "/login"}
                            className="btn-secondary w-full py-3"
                        >
                            Ir al Panel directamente
                        </button>
                    </div>
                )}

                {status === "error" && message !== "ALREADY_INITIALIZED" && (
                    <div className="space-y-6 animate-shake">
                        <div className="p-4 bg-error/10 border border-error/30 rounded-2xl flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-error flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-error">Fallo en la instalación</h2>
                                <p className="text-sm text-text-secondary mt-1">{message}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-black/50 rounded-xl font-mono text-xs text-error/80 overflow-auto max-h-48 custom-scrollbar">
                            <p className="whitespace-pre-wrap">Sugerencia: Espera 1 minuto y vuelve a intentarlo. Es posible que el servidor aún se esté iniciando.</p>
                        </div>

                        <button
                            onClick={() => setStatus("idle")}
                            className="btn-secondary w-full py-3"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-xs text-text-muted italic">
                        * Esta página solo debe usarse la primera vez para inicializar la aplicación.
                    </p>
                </div>
            </div>
        </div>
    )
}
