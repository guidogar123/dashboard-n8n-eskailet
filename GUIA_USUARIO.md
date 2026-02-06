# 📖 Guía de Usuario: AI Agents Dashboard v8.9 🚀

Esta guía te ayudará a poner en marcha tu Dashboard de Agentes de IA desde cero, ya sea para estudiar o para usarlo en producción.

---

## 1. Descarga e Inicio 📂
1. **Obtén el Código**: Descarga el archivo ZIP del proyecto o clona el repositorio de GitHub.
2. **Abre Antigravity**: Descomprime la carpeta y ábrela con Antigravity.
3. **Analiza el Proyecto**: Simplemente escribe en el chat de Antigravity:
   > "Analiza este proyecto para que podamos configurarlo juntos."

---

## 2. Puesta en Marcha en Local 💻
Si quieres probarlo o desarrollarlo en tu ordenador:
1. **Instala Dependencias**: Ejecuta `npm install`.
2. **Variables de Entorno**: Crea un archivo `.env.local` basado en el `.env.example`.
3. **Base de Datos**: 
   - Necesitas una base de datos Postgres (puedes usar Docker).
   - Ejecuta `npx prisma db push` para crear las tablas.
   - Ejecuta `npx prisma db seed` para cargar los **datos demo**.
4. **Lánzalo**: Ejecuta `npm run dev` y entra en `http://localhost:3000`.

---

## 3. Despliegue en Servidor (Producción) 🚀
Para tenerlo online 24/7 (usando EasyPanel o Docker):
1. **Sube el Código**: Sube el proyecto a tu propio repositorio de GitHub.
2. **Configura el Servicio**: Conecta EasyPanel a tu repo.
3. **Variables Críticas**:
   - `DATABASE_URL`: Tu conexión a Postgres.
   - `NEXTAUTH_SECRET`: Un código secreto largo y aleatorio.
   - `NEXTAUTH_URL`: Tu URL pública (https://...).
   - `CRON_SECRET`: Un PIN de seguridad para las APIs de n8n.
4. **Instalación Final**: Entra en `https://tu-dominio.com/setup` para crear al usuario administrador.
   - **User**: `admin@dashboard.com`
   - **Pass**: `Admin123!`

---

## 4. Uso e Integración con n8n 🤖
Para que el Dashboard reciba datos, debes configurar tus flujos en n8n:
1. **Nodo Postgres**: Usa el nodo de Postgres para insertar datos en las tablas `executions` (costes), `leads` (contactos) o `faqs` (preguntas).
2. **Mapeo de ID**: Asegúrate de enviar siempre el `execution.id` de n8n a la columna `n8n_execution_id` del Dashboard.
3. **Limpieza**: Cuando quieras borrar los datos de ejemplo y empezar de verdad, ve a **Ajustes > Mantenimiento** y pulsa **RESET TOTAL**.

---
> [!TIP]
> **Ayuda Inteligente**: Recuerda que puedes pedirle a Antigravity: *"Cambia los colores del dashboard"* o *"Añade un campo nuevo a la tabla de leads"* y él lo hará por ti en segundos. 🏁🔝✨⚖️💰🛡️🚀
