Claude
Verificando el algoritmo de validación de la cédula
Ya con todo desplegado, esto es lo que haces, en orden.

Antes de grabar (10 min)
Prepara datos de ejemplo en el deploy, para no crear todo en vivo: 1 tipo de ruta, 3 paradas, 1 ruta, 1 unidad, 1 usuario con rol chofer y 1 chofer. Deja sin crear el turno y un chofer nuevo, porque esos los harás en cámara.
Abre estas pestañas: la app en Vercel, el repo en GitHub y VS Code con controllers/crud.js y lib/validators.js.
Cédulas para la demo: válida 1710034065, inválida 1710034066.
Ensaya una vez completa, para saber cuánto dura.
En Loom, graba pantalla completa con tu cámara, y habla con calma.
Guion (5 a 7 minutos)
1. Introducción (30 s) · pantalla: el documento de análisis o el README

“Hola, soy Gabriel Palacios, de Ingeniería Web. Mi proyecto es un sistema de monitoreo y control en tiempo real del transporte urbano de Quito. En este video explico la administración, que es el módulo que alimenta el core: ahí se configuran los tipos de ruta con su umbral de ocupación, las rutas con sus paradas, las unidades, los choferes y los turnos. El core usa esos datos para decidir cuándo una unidad debe omitir paradas.”

2. Arquitectura MVC y repositorio (1 min) · pantalla: VS Code y GitHub

“Está hecho con Next.js y MongoDB, y sigue MVC. Los modelos están en la carpeta models, con los esquemas de Mongoose. El controlador está en controllers/crud.js y en las rutas de app/api: ahí van el CRUD y las validaciones. Las vistas están en app, y las pantallas se generan a partir de la configuración en lib/recursos.js.”

Muestra el repo en GitHub con el historial de commits y el README, y di que el código está versionado y desplegado.

3. Login y seguridad (30 s) · pantalla: la app

“Para entrar hay que iniciar sesión. La sesión usa un token en una cookie httpOnly, las contraseñas se guardan con hash y solo el rol administrador accede a este módulo.”

Inicia sesión.

4. CRUD y orden de datos (1 min 30 s) · pantalla: la app
Recorre rápido Tipos de ruta → Paradas → Rutas.

“Un tipo de ruta define si permite omitir paradas, el máximo de paradas omitidas y el umbral de ocupación. Son los parámetros que el core evalúa.”

Edita un registro y muestra que el borrado se bloquea si tiene dependencias, por ejemplo intenta eliminar el tipo de ruta que ya usa una ruta.

5. Dropdowns, claves foráneas (1 min 30 s) · pantalla: Turnos

“Ningún formulario pide escribir un ID. En Turnos, primero elijo la ruta; el dropdown de unidades estaba bloqueado hasta ese momento y ahora solo carga las unidades de esa ruta. Si cambio la ruta, la unidad se reinicia. Después elijo el chofer y las fechas.”

Crea el turno. Luego muestra en VS Code el endpoint GET /api/unidades?ruta=... en controllers/crud.js (el filtro filtros: ['ruta']). En Rutas, muestra el selector de paradas con orden.

6. Validación en back-end (1 min 30 s) · pantalla: Choferes y VS Code

“La cédula es un dato sensible, así que no puede validarse solo en el navegador. Voy a crear un chofer con la cédula 1710034066.”

Pulsa Guardar y muestra el mensaje de error que viene del servidor. Luego, en VS Code, abre choferes.preparar en controllers/crud.js y la función cedulaValida en lib/validators.js:

“Es el algoritmo de módulo 10 de la cédula ecuatoriana. Se ejecuta en el servidor antes de grabar en MongoDB. Ahora uso una cédula válida, 1710034065, y se guarda.”

Para reforzar la idea, puedes abrir DevTools → Network y mostrar que la petición POST /api/choferes devuelve 400 con la cédula inválida. Menciona también que el servidor valida contraseña, placa, umbral y choques de turnos.

7. Cierre (20 s)

“Con esto la administración queda lista para alimentar el core. Los siguientes pasos son el simulador de flota y el motor de acciones. Gracias.”

Después de grabar
Sube el video a Loom (o a YouTube como “no listado”) y prueba el enlace en una ventana de incógnito para confirmar que se puede ver.
Confirma que el README tiene el link del deploy y que el último git push ya está en GitHub.
Entrega lo que pida tu docente en la plataforma de la universidad: normalmente, el link del video, el del repositorio y el del deploy.
Si quieres, te ayudo a revisar tu README antes de entregarlo, o a ensayar el guion con las partes donde suelen trabarse los estudiantes (el filtro de turnos y la cédula).

madname el readme file con el link de vercel

Decidiendo si pedir el enlace o entregar el README igualmente
No tengo tu link de Vercel, y no quiero inventar uno. Pégamelo aquí (el que termina en .vercel.app) y te devuelvo el README.md listo para reemplazar.

Si quieres que también quede el repositorio de GitHub y el video en el README, pásame esos dos links junto con el de Vercel, y de una vez queda completo para entregar.

https://admin-buses-quito.vercel.app/

Ejecutó un comando, archivos compartidos
Ya está el README.md con tu link de Vercel en la línea Deploy. Reemplaza el que tienes en la raíz del proyecto y súbelo:

bash
git add README.md
git commit -m "docs: agrega enlace del deploy"
git push
Si tu docente necesita entrar a la app para revisarla, puedes agregar al README una sección con un usuario de prueba. Si lo haces, cambia primero la contraseña por defecto (Admin12345), porque el repositorio es público y esa clave daría acceso de administrador a tu base de datos.

Cuando tengas el link del video de Loom, pégamelo y lo agrego también al README, con el del repositorio si quieres.

Readme
Documento
·MD



Claude es una IA y puede cometer errores.


Readme · MD
# Administración · Monitoreo y control del transporte urbano de Quito
 
Módulo de administración (MVC) que alimenta el core del sistema de monitoreo en tiempo real de buses de Quito (SIU/SAE). Proyecto de Ingeniería Web, UDLA.
 
**Deploy:** https://admin-buses-quito.vercel.app/
 
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
 
Claude terminó la respuesta
