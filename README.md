# Administración · Monitoreo y control del transporte urbano de Quito

Módulo de administración (MVC) que alimenta el core del sistema de monitoreo en tiempo real de buses de Quito (SIU/SAE). Proyecto de Ingeniería Web, UDLA.

**Deploy:** _pega aquí el enlace de Vercel_

## Qué administra

Usuarios y roles, tipos de ruta (umbral de ocupación, máximo de paradas omitidas), paradas, rutas (con paradas ordenadas), unidades, choferes y turnos. Estos datos son los que el core usa para generar acciones de control.

## Stack

Next.js 14 (App Router) · MongoDB + Mongoose · JWT en cookie httpOnly (jose) · bcryptjs

## Arquitectura MVC

| Capa | Carpeta | Contenido |
|---|---|---|
| Modelo | `models/` | Esquemas de Mongoose |
| Vista | `app/`, `lib/recursos.js` | Pantallas de administración y su configuración |
| Controlador | `controllers/crud.js`, `app/api/` | CRUD, validaciones y reglas de negocio |

## Requisitos de la tarea

- **Validación en back-end de un dato sensible:** la cédula del chofer se valida en `controllers/crud.js` (`choferes.preparar`) con `lib/validators.js` antes de grabar. También se validan en el servidor la contraseña (se guarda con hash), la placa, el umbral de ocupación y los choques de turnos.
- **Claves foráneas con dropdowns:** ningún formulario pide un ID a mano. En **Turnos** el dropdown de *Ruta* filtra el de *Unidad* (`/api/unidades?ruta=...`). Las rutas arman su lista de paradas con selectores ordenados.
- El servidor además verifica que cada clave foránea exista y bloquea eliminar registros con dependencias.

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # completa MONGODB_URI y JWT_SECRET
npm run seed                 # crea los roles y el usuario administrador
npm run dev                  # http://localhost:3000
```

Requiere Node 20 o superior. Ingresa con el correo y la contraseña de `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

## Deploy (Vercel + MongoDB Atlas)

1. Crea un clúster gratuito en Atlas y permite el acceso de red (`0.0.0.0/0`).
2. Importa el repositorio en Vercel.
3. Configura `MONGODB_URI` y `JWT_SECRET` en *Environment Variables*.
4. Ejecuta `npm run seed` una vez, desde tu máquina, apuntando a la base de Atlas.

## Pendiente (siguientes etapas)

Colecciones del core (datos en tiempo real y acciones), simulador de flota, trazado de la ruta (LineString) y paneles de supervisor y chofer.
