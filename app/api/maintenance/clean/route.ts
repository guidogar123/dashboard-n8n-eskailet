import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        // Solo administradores pueden limpiar la base de datos
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { days, type } = body // type: 'executions', 'faqs', 'both', 'factory-reset'

        if (type === 'factory-reset') {
            // Borrado TOTAL de datos dinámicos (manteniendo usuarios y configuración de precios)
            const [delExecs, delFaqs, delLeads] = await Promise.all([
                prisma.execution.deleteMany({}),
                prisma.faq.deleteMany({}),
                prisma.lead.deleteMany({}),
            ])

            return NextResponse.json({
                message: "Reset de fábrica completado",
                deletedExecutions: delExecs.count,
                deletedFaqs: delFaqs.count,
                deletedLeads: delLeads.count
            })
        }

        if (!days || isNaN(days)) {
            return NextResponse.json({ error: "Días no válidos" }, { status: 400 })
        }

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days))

        const results: any = {
            deletedExecutions: 0,
            deletedFaqs: 0
        }

        if (type === 'executions' || type === 'both') {
            const deleted = await prisma.execution.deleteMany({
                where: {
                    startedAt: {
                        lt: cutoffDate
                    }
                }
            })
            results.deletedExecutions = deleted.count
        }

        if (type === 'faqs' || type === 'both') {
            const deleted = await prisma.faq.deleteMany({
                where: {
                    date: {
                        lt: cutoffDate
                    }
                }
            })
            results.deletedFaqs = deleted.count
        }

        return NextResponse.json({
            message: "Limpieza completada",
            ...results
        })

    } catch (error) {
        console.error('Error in maintenance cleanup:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
