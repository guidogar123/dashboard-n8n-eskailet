import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import DashboardShell from "@/components/layout/DashboardShell"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    const { user } = session

    return (
        <DashboardShell user={user}>
            {children}
        </DashboardShell>
    )
}
