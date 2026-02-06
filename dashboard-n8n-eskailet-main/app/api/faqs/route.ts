import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const agentName = searchParams.get('agentName')
        const search = searchParams.get('search')

        const where: any = {}
        if (agentName) where.agentName = { contains: agentName, mode: 'insensitive' }
        if (search) {
            where.question = { contains: search, mode: 'insensitive' }
        }

        const allFaqs = await prisma.faq.findMany({
            where,
            orderBy: {
                date: 'desc',
            },
        })

        // Agrupación agresiva para evitar duplicados por espacios o puntuación
        const groupedMap = allFaqs.reduce((acc: Record<string, any>, curr) => {
            const normalizedQuestion = curr.question
                .trim()
                .toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .replace(/\s{2,}/g, " ")

            if (!acc[normalizedQuestion]) {
                acc[normalizedQuestion] = {
                    id: curr.id,
                    question: curr.question,
                    frequency: 0,
                    agentName: curr.agentName,
                    category: curr.category,
                    date: curr.date
                }
            }

            acc[normalizedQuestion].frequency += (curr.frequency || 1)

            if (curr.agentName && !acc[normalizedQuestion].agentName) {
                acc[normalizedQuestion].agentName = curr.agentName
            }

            if (new Date(curr.date) > new Date(acc[normalizedQuestion].date)) {
                acc[normalizedQuestion].date = curr.date
            }

            return acc
        }, {})

        const faqs = Object.values(groupedMap)
            .sort((a: any, b: any) => b.frequency - a.frequency)
            .slice(0, 100)

        return NextResponse.json({ faqs })
    } catch (error) {
        console.error('Error fetching FAQs:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
