import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const fromParam = searchParams.get('from')
        const toParam = searchParams.get('to')

        const now = new Date()
        const todayAtZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const startDate = fromParam ? new Date(fromParam) : defaultFrom
        const endDate = toParam ? new Date(toParam) : defaultTo
        endDate.setHours(23, 59, 59, 999)

        const duration = endDate.getTime() - startDate.getTime()
        const prevStartDate = new Date(startDate.getTime() - duration)
        const prevEndDate = new Date(endDate.getTime() - duration)

        const pricings = await prisma.modelPricing.findMany()
        const pricingMap = pricings.reduce((acc: any, p) => {
            acc[p.modelName.toLowerCase()] = {
                input: Number(p.inputPricePer1m),
                output: Number(p.outputPricePer1m)
            }
            return acc
        }, {})

        const calculateExecCost = (exec: any) => {
            // Si el coste ya viene definido y es mayor que 0, lo usamos.
            // Si es 0 o null, intentamos calcularlo por tokens.
            const dbCost = Number(exec.costUsd || 0)
            if (dbCost > 0) return dbCost

            const modelKey = exec.modelUsed?.toLowerCase() || 'gpt-4o-mini'
            const pricing = pricingMap[modelKey] || pricingMap['gpt-4o-mini'] || { input: 0.15, output: 0.6 }

            let estimatedCost = 0
            if (exec.inputTokens && exec.outputTokens) {
                estimatedCost = (Number(exec.inputTokens) * (pricing.input / 1000000)) + (Number(exec.outputTokens) * (pricing.output / 1000000))
            } else if (exec.totalTokens) {
                // Split 70/30 si no hay desglose
                const input = Number(exec.totalTokens) * 0.7
                const output = Number(exec.totalTokens) * 0.3
                estimatedCost = (input * (pricing.input / 1000000)) + (output * (pricing.output / 1000000))
            }

            return estimatedCost
        }

        const currentExecutions = await prisma.execution.findMany({
            where: { startedAt: { gte: startDate, lte: endDate } },
            select: { costUsd: true, modelUsed: true, inputTokens: true, outputTokens: true, totalTokens: true, status: true, agentName: true, startedAt: true, firstUserMessage: true }
        })

        const totalCost = currentExecutions.reduce((acc, exec) => acc + calculateExecCost(exec), 0)
        const totalExecutions = currentExecutions.length
        const successCount = currentExecutions.filter(e => e.status === 'SUCCESS').length
        const errorCount = currentExecutions.filter(e => e.status === 'ERROR').length

        // Mejora: Sumar tokens de entrada y salida si el total viene vacío de n8n
        const totalTokens = currentExecutions.reduce((acc, exec) => {
            const sum = (exec.inputTokens || 0) + (exec.outputTokens || 0)
            const reported = exec.totalTokens || 0
            return acc + (reported > 0 ? reported : sum)
        }, 0)

        const modelDistMap = currentExecutions.reduce((acc: any, exec) => {
            const model = exec.modelUsed || 'Unknown'
            if (!acc[model]) acc[model] = { name: model, count: 0 }
            acc[model].count += 1
            return acc
        }, {})
        const modelDistribution = Object.values(modelDistMap)

        const activeAgentsCount = new Set(currentExecutions.map(e => e.agentName)).size

        const leadsToday = await prisma.lead.count({
            where: { createdAt: { gte: todayAtZero } }
        })

        const prevExecutions = await prisma.execution.findMany({
            where: { startedAt: { gte: prevStartDate, lte: prevEndDate } },
            select: { costUsd: true, modelUsed: true, inputTokens: true, outputTokens: true, totalTokens: true }
        })
        const prevTotalCost = prevExecutions.reduce((acc, exec) => acc + calculateExecCost(exec), 0)

        const currentLeads = await prisma.lead.count({ where: { date: { gte: startDate, lte: endDate } } })
        const prevLeads = await prisma.lead.count({ where: { date: { gte: prevStartDate, lte: prevEndDate } } })

        // FAQs agrupadas para el widget de Top FAQs
        const allFaqs = await prisma.faq.findMany({
            where: { date: { gte: startDate, lte: endDate } },
        })

        const groupedFaqs = allFaqs.reduce((acc: any, curr) => {
            const key = curr.question.trim().toLowerCase()
            if (!acc[key]) acc[key] = { ...curr, frequency: 0 }
            acc[key].frequency += (curr.frequency || 1)
            return acc
        }, {})

        const topFaqs = Object.values(groupedFaqs)
            .sort((a: any, b: any) => b.frequency - a.frequency)
            .slice(0, 5)

        const timelineMap = currentExecutions.reduce((acc: any, exec) => {
            const day = exec.startedAt.toISOString().split('T')[0]
            if (!acc[day]) acc[day] = { date: day, total_cost: 0, total_count: 0, success_count: 0, error_count: 0, total_tokens: 0 }
            const cost = calculateExecCost(exec)
            acc[day].total_cost += cost
            acc[day].total_count += 1
            const sum = (exec.inputTokens || 0) + (exec.outputTokens || 0)
            const reported = exec.totalTokens || 0
            const tokens = reported > 0 ? reported : sum

            acc[day].total_tokens += tokens
            if (exec.status === 'SUCCESS') acc[day].success_count += 1
            else acc[day].error_count += 1
            return acc
        }, {})
        const timeline = Object.values(timelineMap).sort((a: any, b: any) => a.date.localeCompare(b.date))

        const agentMap = currentExecutions.reduce((acc: any, exec) => {
            const name = exec.agentName || 'Unknown'
            if (!acc[name]) acc[name] = { agentName: name, count: 0, totalCost: 0 }
            acc[name].count += 1
            acc[name].totalCost += calculateExecCost(exec)
            return acc
        }, {})
        const executionsByAgent = Object.values(agentMap).sort((a: any, b: any) => b.count - a.count)

        const costChange = prevTotalCost > 0 ? ((totalCost - prevTotalCost) / prevTotalCost) * 100 : 0
        const leadsChange = prevLeads > 0 ? ((currentLeads - prevLeads) / prevLeads) * 100 : 0

        return NextResponse.json({
            totalCost,
            costChange,
            totalExecutions,
            successRate: totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0,
            successCount,
            errorCount,
            totalTokens,
            newLeads: currentLeads,
            leadsChange,
            leadsToday,
            activeAgentsCount,
            topFaqs,
            timeline,
            executionsByAgent,
            modelDistribution
        })
    } catch (error) {
        console.error('Error fetching metrics:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
