"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
            <div className="p-4 bg-error/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-error" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Algo salió mal</h2>
            <p className="text-text-secondary text-center max-w-md">
                Hubo un problema al cargar esta sección. Por favor, intenta de nuevo.
            </p>
            <button
                onClick={() => reset()}
                className="btn-secondary flex items-center gap-2"
            >
                <RefreshCcw className="w-4 h-4" />
                Reintentar
            </button>
        </div>
    )
}
