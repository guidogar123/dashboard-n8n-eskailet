import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function internalSeed() {
    console.log('Starting internal seed (Final Production Demo v9.2)...')

    // Clean dynamic data for a fresh start in demo
    await prisma.execution.deleteMany({})
    await prisma.lead.deleteMany({})
    await prisma.faq.deleteMany({})

    // Hash passwords
    const ADMIN_HASH = await bcrypt.hash('Admin123!', 10)
    const VIEWER_HASH = await bcrypt.hash('Viewer123!', 10)

    // 1. Create users
    await prisma.user.upsert({
        where: { email: 'admin@dashboard.com' },
        update: {},
        create: {
            email: 'admin@dashboard.com',
            name: 'Andrea Pro',
            passwordHash: ADMIN_HASH,
            role: 'ADMIN',
        },
    })

    await prisma.user.upsert({
        where: { email: 'viewer@dashboard.com' },
        update: {},
        create: {
            email: 'viewer@dashboard.com',
            name: 'Invitado Clase',
            passwordHash: VIEWER_HASH,
            role: 'VIEWER',
        },
    })

    // 2. Seed model pricing
    const models = [
        { name: 'o1', provider: 'OpenAI', input: 15.0, output: 60.0 },
        { name: 'o3-mini', provider: 'OpenAI', input: 1.1, output: 4.4 },
        { name: 'gpt-4o', provider: 'OpenAI', input: 2.5, output: 10.0 },
        { name: 'gpt-4o-mini', provider: 'OpenAI', input: 0.15, output: 0.6 },
        { name: 'claude-3-5-sonnet', provider: 'Anthropic', input: 3.0, output: 15.0 },
        { name: 'claude-3-5-haiku', provider: 'Anthropic', input: 0.25, output: 1.25 },
        { name: 'gemini-2.0-flash', provider: 'Google', input: 0.1, output: 0.4 },
        { name: 'gemini-1.5-pro', provider: 'Google', input: 1.25, output: 5.0 },
        { name: 'deepseek-v3', provider: 'DeepSeek', input: 0.27, output: 1.1 },
    ]

    for (const m of models) {
        await prisma.modelPricing.upsert({
            where: { modelName: m.name },
            update: {
                inputPricePer1m: m.input,
                outputPricePer1m: m.output,
            },
            create: {
                modelName: m.name,
                provider: m.provider,
                inputPricePer1m: m.input,
                outputPricePer1m: m.output,
            },
        })
    }

    // 3. Seed Massive Demo Data (last 30 days)
    const now = new Date()
    const agents = ['Agente Ventas', 'Soporte AI', 'Captador Inmo', 'Asistente Legal', 'Dispatcher']
    const modelsPool = ['gpt-4o-mini', 'gpt-5-mini', 'gpt-4o', 'claude-3-sonnet']

    console.log('Generating 500+ demo executions over 30 days...')

    // Generate ~500 executions
    for (let i = 0; i < 550; i++) {
        const agent = agents[Math.floor(Math.random() * agents.length)]
        const model = modelsPool[Math.floor(Math.random() * modelsPool.length)]

        // Distribution more dense in recent days
        const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 30)
        const date = new Date(now.getTime() - (daysAgo * 86400000) - (Math.random() * 86400000))

        const inputTokens = Math.floor(Math.random() * 8000) + 1000
        const outputTokens = Math.floor(Math.random() * 3000) + 200

        await prisma.execution.create({
            data: {
                agentName: agent,
                n8nExecutionId: `demo-${i}-${Math.random().toString(36).substr(2, 6)}`,
                status: Math.random() > 0.05 ? 'SUCCESS' : 'ERROR',
                startedAt: date,
                endedAt: new Date(date.getTime() + (Math.random() * 10000)),
                durationSeconds: Math.floor(Math.random() * 15) + 2,
                modelUsed: model,
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                costUsd: 0,
            }
        })

        // Generate leads (about 10% of executions)
        if (i % 10 === 0) {
            await prisma.lead.create({
                data: {
                    name: `Lead Demo ${i}`,
                    email: `user${i}@demo.ai`,
                    phone: `+34 6${Math.floor(Math.random() * 900000000 + 100000000)}`,
                    source: agent,
                    summary: `Potencial cliente interesado en automatización vía ${agent}`,
                    date: date,
                }
            })
        }
    }

    // Generate Diverse FAQs
    const faqData = [
        { q: "¿Qué planes de precios tenéis?", cat: "Ventas", count: 120, agent: "Agente Ventas" },
        { q: "¿Cómo recupero mi contraseña?", cat: "Soporte", count: 85, agent: "Soporte AI" },
        { q: "¿Integráis con n8n?", cat: "Técnico", count: 64, agent: "Global" },
        { q: "Quiero hablar con un humano", cat: "Soporte", count: 58, agent: "Asistente Legal" },
        { q: "¿Dónde está mi pedido?", cat: "Logística", count: 42, agent: "Dispatcher" },
        { q: "¿Cumplís con la RGPD?", cat: "Legal", count: 35, agent: "Asistente Legal" },
        { q: "¿Hay versión gratuita?", cat: "Ventas", count: 31, agent: "Agente Ventas" },
        { q: "Error en el pago", cat: "Finanzas", count: 18, agent: "Soporte AI" },
    ]

    for (const faq of faqData) {
        await prisma.faq.create({
            data: {
                question: faq.q,
                category: faq.cat,
                frequency: faq.count,
                agentName: faq.agent,
                date: now
            }
        })
    }

    console.log('Final Production Seed completed successfully')
    return { success: true }
}

async function main() {
    await internalSeed()
}

if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}
