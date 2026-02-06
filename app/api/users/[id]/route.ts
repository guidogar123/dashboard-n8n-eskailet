import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // En Next.js 15+ params es una Promise
        const { id } = await context.params

        if (!id) {
            return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
        }

        // Prevent self-deletion
        if (id === session.user?.id) {
            return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        // Devolver un error más detallado si es posible para depurar
        return NextResponse.json({
            error: "Error interno al eliminar usuario",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
