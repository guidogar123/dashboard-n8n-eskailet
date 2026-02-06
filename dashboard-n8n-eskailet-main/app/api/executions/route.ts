import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const agentName = searchParams.get('agentName')
        const modelUsed = searchParams.get('modelUsed')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (agentName) where.agentName = { contains: agentName, mode: 'insensitive' }
        if (modelUsed) where.modelUsed = modelUsed
        if (startDate || endDate) {
            where.startedAt = {}
            if (startDate) where.startedAt.gte = new Date(startDate)
            if (endDate) where.startedAt.lte = new Date(endDate)
        }

        // Fetch pricing for on-the-fly cost calculation
        const pricings = await prisma.modelPricing.findMany()
        const pricingMap = pricings.reduce((acc: any, p) => {
            acc[p.modelName.toLowerCase()] = {
                input: Number(p.inputPricePer1m),
                output: Number(p.outputPricePer1m)
            }
            return acc
        }, {})

        const calculateExecCost = (exec: any) => {
            const dbCost = Number(exec.costUsd || 0)
            if (dbCost > 0) return dbCost

            const modelKey = exec.modelUsed?.toLowerCase() || ''
            // Búsqueda inteligente de precio: intenta coincidencia exacta, luego gpt-4o-mini como failover
            const pricing = pricingMap[modelKey] || pricingMap['gpt-4o-mini'] || { input: 0.15, output: 0.6 }

            let estimatedCost = 0
            if (exec.inputTokens && exec.outputTokens) {
                estimatedCost = (Number(exec.inputTokens) * (pricing.input / 1000000)) + (Number(exec.outputTokens) * (pricing.output / 1000000))
            } else if (exec.totalTokens) {
                const input = Number(exec.totalTokens) * 0.7
                const output = Number(exec.totalTokens) * 0.3
                estimatedCost = (input * (pricing.input / 1000000)) + (output * (pricing.output / 1000000))
            }

            return estimatedCost
        }

        // Get executions with pagination
        const [rawExecutions, total] = await Promise.all([
            prisma.execution.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    startedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.execution.count({ where }),
        ])

        // Apply dynamic cost calculation to each execution
        const executions = rawExecutions.map(exec => ({
            ...exec,
            costUsd: calculateExecCost(exec)
        }))

        return NextResponse.json({
            executions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching executions:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
