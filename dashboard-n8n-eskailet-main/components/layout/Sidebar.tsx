"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Activity,
    Users,
    FileQuestion,
    User,
    Settings,
    Shield,
    Bot
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ejecuciones", href: "/dashboard/executions", icon: Activity },
    { name: "Leads", href: "/dashboard/leads", icon: Users },
    { name: "FAQs", href: "/dashboard/faqs", icon: FileQuestion },
    { name: "Mi Perfil", href: "/dashboard/profile", icon: User },
]

const adminNavigation = [
    { name: "Ajustes", href: "/dashboard/settings", icon: Settings },
]

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname()

    return (
        <aside className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen flex-shrink-0 relative z-50">
            {/* Header / Logo Area */}
            <div className="p-8 flex items-center gap-4">
                <div className="relative w-12 h-12">
                    <img
                        src="/logo.png"
                        alt="Eskailet Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(218,230,137,0.4)]"
                    />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tighter leading-none">ESKAILET</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">n8n Dashboard</p>
                </div>
            </div>

            <div className="p-6">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-xs">●</span>
                    </div>
                    <div className="w-full bg-slate-950 text-slate-300 text-sm rounded-lg py-2 pl-8 pr-4 border border-slate-800">
                        {user?.name || 'Admin'}
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-primary text-slate-900 font-bold shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : ''}`} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    )
                })}

                {user?.role === 'ADMIN' && (
                    <>
                        <div className="pt-6 pb-2">
                            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Administración
                            </p>
                        </div>
                        {adminNavigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                                            ? 'bg-primary text-slate-950 font-black shadow-[0_0_20px_rgba(218,230,137,0.4)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'group-hover:text-primary transition-colors'}`} />
                                    <span className="text-sm tracking-tight">{item.name}</span>
                                </Link>
                            )
                        })}
                    </>
                )}
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none mt-1">
                                {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'EDITOR' ? 'Editor' : 'Colaborador'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
