# 🚀 Guía de Despliegue Rápido en Easypanel

Esta guía está diseñada para que puedas instalar el **Eskailet n8n Dashboard** en tu propio servidor VPS utilizando **Easypanel** en menos de 5 minutos, sin necesidad de conocimientos avanzados de programación.

---

## 📋 Requisitos Previos

1.  Un servidor VPS (Hetzner, DigitalOcean, Vultr, etc.) con **Easypanel instalado**.
2.  Una cuenta de GitHub.
3.  Este repositorio "Forkeado" en tu cuenta de GitHub (haz clic en el botón **"Fork"** arriba a la derecha en GitHub).

---

##  paso 1: Crear el Proyecto en Easypanel

1.  Entra a tu panel de Easypanel.
2.  Haz clic en el botón **"Create Project"**.
3.  Ponle un nombre, por ejemplo: `eskailet-dashboard`.
4.  Haz clic en **"Create"**.

---

## Paso 2: Crear la Base de Datos (PostgreSQL)

El dashboard necesita una base de datos para guardar la información. La crearemos primero.

1.  Dentro de tu proyecto, haz clic en **"+ Service"**.
2.  Busca y selecciona **"PostgreSQL"** (Database).
3.  Haz clic en **"Create"**.
4.  Una vez creado, haz clic en el servicio `postgres` para ver sus detalles.
5.  Desplázate hacia abajo hasta la sección **"Connection"**.
6.  Copia la **"Internal Connection String"** (URL de conexión interna). Se verá algo así:
    `postgres://postgres:password@nome-proyecto_postgres:5432/nombre-proyecto_postgres`
    
    > ⚠️ **IMPORTANTE:** Guarda esta URL, la necesitarás en el siguiente paso.

---

## Paso 3: Desplegar la Aplicación

1.  Vuelve a tu proyecto y haz clic en **"+ Service"**.
2.  Selecciona la pestaña **"App"** (Aplicación).
3.  Elige **"GitHub"** como fuente (Source).
4.  Selecciona tu repositorio (el `fork` que hiciste de `dashboard-n8n-eskailet`).
5.  En **"Build Settings"**, Easypanel detectará automáticamente que es un proyecto `Dockerfile`. Si no, selecciónalo manualmente.
6.  Haz clic en **"Create"**.

---

## Paso 4: Configurar Variables de Entorno

Antes de que la aplicación funcione, necesitamos configurar las "llaves" del sistema.

1.  Haz clic en el servicio de tu aplicación (App) que acabas de crear.
2.  Ve a la pestaña **"Environment"**.
3.  Haz clic en **"Edit"** o **"Add Variable"** y añade las siguientes:

| Nombre (Key) | Valor (Value) | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(Pega aquí la URL que copiaste en el Paso 2)* | Conexión a la base de datos (añade `?sslmode=disable` al final si da error). |
| `NEXTAUTH_SECRET` | `eskailet-secret-base-123` | Contraseña interna para encriptar sesiones (pon algo seguro). |
| `NEXTAUTH_URL` | `https://midominio.easypanel.host` | La URL pública de tu aplicación (la que te da Easypanel). |
| `CRON_SECRET` | `cron-secret-123` | Clave para tareas automáticas. |

4.  Haz clic en **"Save"** y luego en **"Deploy"** (arriba a la derecha) para aplicar los cambios.

---

## Paso 5: Inicializar la Base de Datos (¡Vital!)

La aplicación ya está corriendo, pero la base de datos está vacía. Vamos a crear las tablas y el usuario administrador.

1.  En el dashboard de tu aplicación en Easypanel, ve a la pestaña **"Console"** (Terminal).
2.  Haz clic en **"Connect"**.
3.  Escribe el siguiente comando y pulsa Enter:

    ```bash
    npx prisma migrate deploy
    ```

    *(Deberías ver un mensaje en verde diciendo que las migraciones se aplicaron).*

4.  Ahora, escribe este otro comando para crear el usuario administrador:

    ```bash
    npx prisma db seed
    ```

    *(Esto creará el usuario Admin por defecto).*

---

## 🎉 ¡Listo para Usar!

Abre la URL de tu aplicación. Deberías ver la pantalla de Login con el logo de **Eskailet**.

### Credenciales de Acceso por Defecto:

*   **Email:** `admin@dashboard.com`
*   **Contraseña:** `Admin123!`

> 🛡️ **SEGURIDAD:** Entra inmediatamente al dashboard, ve a "Perfil" o "Ajustes" (si está disponible) y cambia tu contraseña lo antes posible.

---

## ¿Dudas o Problemas?

Si algo no funciona, revisa:
1.  Que la `DATABASE_URL` sea correcta.
2.  Que hayas ejecutado los comandos del **Paso 5** en la consola.
3.  Revisa los **"Logs"** de la aplicación para ver errores específicos.
