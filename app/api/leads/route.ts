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
        const search = searchParams.get('search')
        const source = searchParams.get('source')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (source) {
            where.source = { contains: source, mode: 'insensitive' }
        }
        if (startDate || endDate) {
            where.date = {}
            if (startDate) where.date.gte = new Date(startDate)
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                where.date.lte = end
            }
        }

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: {
                    date: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.lead.count({ where }),
        ])

        return NextResponse.json({
            leads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
