import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized. Solo administradores pueden ver diagnósticos." }, { status: 401 })
        }

        const stats = {
            users: await prisma.user.count(),
            executions: await prisma.execution.count(),
            leads: await prisma.lead.count(),
            faqs: await prisma.faq.count(),
            pricing: await prisma.modelPricing.count(),
        }

        const envVars = {
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            DATABASE_URL_START: process.env.DATABASE_URL?.substring(0, 15) + "...",
            NODE_ENV: process.env.NODE_ENV,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
            PORT: process.env.PORT || 'Not set',
        }

        return NextResponse.json({
            status: "connected",
            timestamp: new Date().toISOString(),
            stats,
            envVars
        })
    } catch (error: any) {
        console.error('Diagnostic error:', error)
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
