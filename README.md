# ESKAILET n8n dashboard v9.0 "Mobile Ready" 🚀

Dashboard técnico de grado empresarial diseñado para monitorear cada ejecución de tus agentes de IA en n8n con precisión quirúrgica.

## 🌟 Características v9.0
- ✅ **Dashboard "Observer"**: Analítica avanzada con filtros de fecha dinámicos e inversión en tiempo real.
- ✅ **Optimización Responsive**: Diseño adaptativo 100% compatible con móviles con menú lateral colapsable.
- ✅ **Filtros Inteligentes**: Nuevo sistema de filtrado avanzado en Ejecuciones y CRM por Agente y rango de fechas.
- ✅ **Cálculo de Costes Dinámico**: Motor inteligente que calcula la inversión basada en tokens aunque n8n no envíe el coste.
- ✅ **Agrupación P. Frecuentes**: Sistema de agrupación automática de FAQs para detectar tendencias reales de usuario.
- ✅ **Control de Ejecuciones**: Historial técnico detallado (tokens, duración, status) con decimales de alta precisión.
- ✅ **Gestión Multi-Usuario**: Sistema de roles (Admin, Editor, Viewer) y acceso seguro al perfil personal.
- ✅ **CRM de Leads**: Captura de prospectos integrada pero independiente de la ejecución técnica.

## 📋 Requisitos Previos

- Node.js 20+
- PostgreSQL 15+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el Repositorio

\`\`\`bash
git clone <tu-repo-url>
cd ai-agents-dashboard
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita \`.env.local\`:

\`\`\`env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_agents_dashboard"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"
NEXTAUTH_URL="http://localhost:3000"
CRON_SECRET="genera-otro-secret-aleatorio"
\`\`\`

**Generar secrets seguros:**

\`\`\`bash
openssl rand -base64 32
\`\`\`

### 4. Configurar Base de Datos

#### Opción A: PostgreSQL Local

\`\`\`bash
# Crear base de datos
createdb ai_agents_dashboard

# Ejecutar migraciones
npx prisma migrate dev

# Poblar datos iniciales
npx prisma db seed
\`\`\`

#### Opción B: Docker Compose

\`\`\`bash
docker-compose up -d postgres
npx prisma migrate dev
npx prisma db seed
\`\`\`

### 5. Ejecutar en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

## 👤 Usuarios Iniciales

Después del seed, puedes iniciar sesión con:

**Admin:**
- Email: \`admin@dashboard.com\`
- Password: \`Admin123!\`

**Viewer:**
- Email: \`viewer@dashboard.com\`
- Password: \`Viewer123!\`

⚠️ **IMPORTANTE**: Cambia estas contraseñas después del primer login.

## � Instalación Rápida (para usuarios de n8n)

Si vienes de la comunidad y quieres instalar esto en tu servidor VPS usando **Easypanel**, hemos preparado una guía paso a paso "a prueba de fallos":

👉 **[VER GUÍA DE INSTALACIÓN EN EASYPANEL (5 MINUTOS)](./DEPLOY_EASYPANEL.md)**

---

## 🐳 Deployment con Docker (Avanzado)

Si prefieres usar Docker directamente sin Easypanel:

### Build y Run

\`\`\`bash
# Build imagen
docker build -t ai-agents-dashboard .

# Run con Docker Compose
docker-compose up -d
\`\`\`

## 🔗 Integración con n8n

### Configurar Conexión PostgreSQL en n8n

1. **Credentials → New Credential → Postgres**
2. Configurar:
   - Host: \`tu-vps-ip\` o \`localhost\`
   - Database: \`ai_agents_dashboard\`
   - User: \`n8n_writer\` (crear con permisos limitados)
   - Password: \`tu-password-seguro\`
   - SSL: Enabled

### Crear Usuario Restringido para n8n

\`\`\`sql
-- En PostgreSQL
CREATE USER n8n_writer WITH PASSWORD 'password-seguro';
GRANT CONNECT ON DATABASE ai_agents_dashboard TO n8n_writer;
GRANT USAGE ON SCHEMA public TO n8n_writer;
GRANT INSERT ON executions, leads TO n8n_writer;
GRANT SELECT ON agents, leads TO n8n_writer;
\`\`\`

### Workflow de Ejemplo

Crea un workflow en n8n que:

1. **Trigger**: Al finalizar ejecución de agente
2. **PostgreSQL Node**: Insert en `executions`

```sql
INSERT INTO executions (
  id,
  agent_name,
  n8n_execution_id,
  status,
  started_at,
  ended_at,
  duration_seconds,
  model_used,
  input_tokens,
  output_tokens,
  total_tokens,
  first_user_message
) VALUES (
  gen_random_uuid(),
  'Nombre de tu Agente',
  '{{$execution.id}}',
  'SUCCESS', -- Debe ser en MAYÚSCULAS: SUCCESS o ERROR
  '{{$execution.startedAt}}',
  '{{$execution.stoppedAt}}',
  {{$execution.duration}},
  '{{$json.model}}',
  {{$json.inputTokens}},
  {{$json.outputTokens}},
  {{$json.totalTokens}},
  '{{$json.firstMessage}}'
);
```

**Nota**: El costo se calcula automáticamente cuando los tokens son registrados.

### 🚀 Nivel Pro: Rastreo automático de Tokens
Si usas un nodo **Code** al final de tu workflow para extraer tokens del resultado de OpenAI/Anthropic, asegúrate de enviar el estado en **MAYÚSCULAS** para que PostgreSQL lo acepte:

```javascript
// En tu nodo Code de n8n:
return {
  status: item.status.toUpperCase(), // 'SUCCESS' o 'ERROR'
  total_tokens: item.usage.totalTokens,
  model: item.model
};
```

## 📊 Modelos Soportados

El dashboard incluye precios actualizados (Enero 2026) para:

- **OpenAI**: GPT-5, GPT-5 Mini, GPT-4o, GPT-4o-mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Pro, Gemini 1.5 Pro

## 🛡️ Seguridad

- ✅ Autenticación con NextAuth.js
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con httpOnly cookies
- ✅ Roles de usuario (ADMIN/VIEWER)
- ✅ Variables de entorno para secretos
- ✅ Usuario PostgreSQL con permisos mínimos para n8n

## 📝 Scripts Disponibles

\`\`\`bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Ejecutar producción
npm run lint         # Linting
npx prisma studio    # UI para base de datos
npx prisma migrate   # Gestión de migraciones
npx prisma db seed   # Poblar datos iniciales
\`\`\`

## 🔧 Estructura del Proyecto

\`\`\`
ai-agents-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── types/                # TypeScript types
├── Dockerfile            # Docker config
├── docker-compose.yml    # Docker Compose
└── README.md             # This file
\`\`\`

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que PostgreSQL esté corriendo
2. Confirma que las variables de entorno estén correctas
3. Revisa los logs: \`docker-compose logs -f app\`
4. Ejecuta migraciones: \`npx prisma migrate deploy\`

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para monitorear agentes de IA
