import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hash, compare } from "bcryptjs"

export async function GET() {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name, email, currentPassword, newPassword } = await request.json()
        const userId = session.user.id

        // Fetch current user with password for validation
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        const dataToUpdate: any = {}

        // Name update (doesn't require password validation for simplicity, but good for name)
        if (name) dataToUpdate.name = name

        // Sensitive updates (email or password) require current password
        if (email || newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Se requiere la contraseña actual para realizar cambios sensibles" }, { status: 400 })
            }

            const isPasswordCorrect = await compare(currentPassword, user.passwordHash)
            if (!isPasswordCorrect) {
                return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
            }

            if (email) {
                // Check if email is already taken by another user
                const existingUser = await prisma.user.findUnique({
                    where: { email }
                })
                if (existingUser && existingUser.id !== userId) {
                    return NextResponse.json({ error: "El email ya está en uso por otro usuario" }, { status: 400 })
                }
                dataToUpdate.email = email
            }

            if (newPassword) {
                dataToUpdate.passwordHash = await hash(newPassword, 10)
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        })

        return NextResponse.json({ user: updatedUser })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
