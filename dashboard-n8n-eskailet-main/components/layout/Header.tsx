"use client"

import { LogOut, Menu } from "lucide-react"
import { signOut } from "next-auth/react"

interface HeaderProps {
    user: {
        name: string
        email: string
    }
    onMenuClick?: () => void
}

export default function Header({ user = { name: "Usuario", email: "" }, onMenuClick }: HeaderProps) {
    return (
        <header className="bg-slate-900 border-b border-slate-800 h-16 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold text-white truncate max-w-[150px] md:max-w-none">
                    Bienvenido, <span className="text-primary">{user?.name}</span>
                </h2>
            </div>

            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
            </button>
        </header>
    )
}
