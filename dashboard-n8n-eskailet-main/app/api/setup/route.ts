import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import prisma from '@/lib/prisma';

const execAsync = promisify(exec);

import { internalSeed } from '@/lib/db-seed';

export async function POST(request: NextRequest) {
    try {
        const { secret, force } = await request.json();
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized: Secret incorrecto' }, { status: 401 });
        }

        // Seguridad extra: Si ya hay un usuario ADMIN, bloqueamos la reinstalación accidental
        // A menos que se use el flag 'force' (para migraciones estructurales)
        if (!force) {
            const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
            if (adminCount > 0) {
                return NextResponse.json({
                    error: 'ALREADY_INITIALIZED',
                    message: 'El sistema ya ha sido inicializado. No se permite reinstalar por seguridad.'
                }, { status: 403 });
            }
        }

        const setupEnv = {
            ...process.env,
            HOME: '/home/nextjs',
            NPM_CONFIG_CACHE: '/home/nextjs/.npm'
        };

        const runCommand = async (cmd: string) => {
            console.log(`Executing: ${cmd}`);
            const result = await execAsync(cmd, { cwd: '/app', env: setupEnv });
            if (result.stderr && !result.stderr.includes('npm warn') && !result.stderr.includes('Update available')) {
                console.warn(`Command stderr (${cmd}):`, result.stderr);
            }
            return result;
        };

        // 1. Ejecutar migraciones o Sincronización Directa (v2.3)
        console.log('Synchronizing database schema (v2.3)...');
        let migrateOutput = '';
        let syncSuccess = false;

        const syncCommands = [
            'prisma db push --accept-data-loss',
            'prisma migrate deploy',
            'npx prisma@5.22.0 db push --accept-data-loss',
            'node ./node_modules/prisma/build/index.js db push --accept-data-loss'
        ];

        for (const cmd of syncCommands) {
            try {
                const res = await runCommand(cmd);
                migrateOutput += `\n[${cmd}]: ${res.stdout}`;
                syncSuccess = true;
                console.log(`Sync successful with: ${cmd}`);
                break;
            } catch (e: any) {
                migrateOutput += `\n[${cmd} FAILED]: ${e.message}`;
                console.error(`Sync attempt failed (${cmd}):`, e.message);
            }
        }

        if (!syncSuccess) {
            throw new Error("No se pudo sincronizar el esquema. Verifica DATABASE_URL. Errores: " + migrateOutput);
        }

        // 2. Ejecutar seeding INTERNO
        console.log('Running internal seed...');
        const seedResult = await internalSeed();

        // 3. Verificación final
        const userCount = await prisma.user.count();
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@dashboard.com' },
            select: { email: true, role: true }
        });

        const response = NextResponse.json({
            success: true,
            diagnostics: {
                version: '4.1',
                totalUsers: userCount,
                adminExists: !!adminUser,
                seedResult
            },
            migration: migrateOutput,
        });

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return response;
    } catch (error: any) {
        console.error('Setup error:', error);
        return NextResponse.json({
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr,
        }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
