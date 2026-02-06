export { auth as middleware } from "@/lib/auth"

export const config = {
    // Proteger todo por defecto, excepto login, setup y estáticos
    matcher: ["/((?!login|setup|api/setup|_next/static|_next/image|favicon.ico).*)"],
}
