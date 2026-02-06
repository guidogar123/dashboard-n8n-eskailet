import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                lastLogin: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { email, password, name, role } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
        }

        const passwordHash = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role: role || "VIEWER",
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
