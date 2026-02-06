import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { internalSeed } from "@/lib/db-seed"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        // Solo administradores pueden sembrar datos
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await internalSeed()

        return NextResponse.json({
            message: "Datos demo cargados correctamente"
        })

    } catch (error) {
        console.error('Error in maintenance seed:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
