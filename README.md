# Food Store · Programación 4

Aplicación de pedidos de comida con catálogo público, carrito, checkout y panel de administración. Autor: **Alejandro Pedrosa**.

- **Repositorio público:** https://github.com/AlejandroPedrosa/TPI-Programacion-IV
- **Video de demostración:** https://youtu.be/hX0ujalS6tg

## Requisitos

- Python **3.11, 3.12 o 3.13** (no usar 3.9 ni 3.14).
- Node.js **20.19+** (con Node 22, usar 22.12+).
- pnpm **10.11.0** recomendado. Instalarlo con `npm install -g pnpm@10.11.0`.
- PostgreSQL **15+**. Se incluye una configuración opcional de Docker Compose con PostgreSQL 16.
- Internet durante la instalación. Las fotos del catálogo se cargan desde URLs externas; si una imagen falla, se muestra un ícono de reemplazo.

## 1. Base de datos con Docker

Desde la raíz `Food_Store/`, con Docker Desktop abierto:

```bash
docker compose up -d db
docker compose ps
docker compose port db 5432
```

Esperar a que `docker compose ps` muestre el servicio `db` como `healthy`. El último comando debe devolver:

```text
127.0.0.1:5433
```

El proyecto usa PostgreSQL 16 dentro de Docker. La conexión desde el backend que corre en tu computadora es:

```env
DATABASE_URL=postgresql://foodstore:foodstore@127.0.0.1:5433/foodstore_db
```

- Base de datos: `foodstore_db`.
- Usuario: `foodstore`.
- Contraseña de desarrollo: `foodstore`.
- Puerto publicado en la computadora: **5433**.
- Puerto interno del contenedor: **5432**.

El puerto 5433 evita usar el 5432 de otro PostgreSQL que pueda estar instalado en la computadora. En `docker-compose.yml`, el bloque de puertos del servicio `db` debe ser:

```yaml
    ports:
      - "127.0.0.1:5433:5432"
```

### Si el contenedor ya estaba creado con la configuración anterior

Después de actualizar el bloque `ports`, ejecutar desde la raíz:

```bash
docker compose up -d --force-recreate db
docker compose port db 5432
```

Esto recrea el contenedor conservando el volumen `foodstore_pg` y sus datos. No hace falta borrar el volumen. Actualizar también `backend/.env` con la URL que usa `127.0.0.1:5433` y reiniciar el backend si estaba ejecutándose.

### Alternativas de desarrollo

Se puede usar una instalación propia de PostgreSQL creando la base y el usuario y adaptando `DATABASE_URL` a esa instancia.

Para probar sin Docker/PostgreSQL, usar `DATABASE_URL=sqlite:///./foodstore.db` en `backend/.env`. El resto de los pasos es igual. Para evaluar concurrencia de stock, usar PostgreSQL: SQLite no implementa bloqueos de filas con `SELECT FOR UPDATE`.

## 2. Backend

Abrir una terminal dentro de `backend/`.

**macOS / Linux:**

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Podés reemplazar `python3.12` por un ejecutable de Python 3.11 o 3.13 instalado.

**Windows PowerShell:**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Si no podés activar el entorno en PowerShell, usá directamente `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`, `.\.venv\Scripts\python.exe -m app.db.seed` y `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`.

Editar `backend/.env` y definir una `SECRET_KEY` propia de al menos 32 caracteres. Para usar el PostgreSQL de Docker, comprobar esta conexión:

```env
DATABASE_URL=postgresql://foodstore:foodstore@127.0.0.1:5433/foodstore_db
```

Después, desde `backend/` y con el entorno activado:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

El seed es **idempotente**: crea el administrador, tres categorías y nueve productos con stock. Ejecutarlo otra vez no duplica datos ni reinicia existencias, precios o pedidos. No crea pedidos ni clientes ficticios.

- API: `http://localhost:8000/api/v1`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Los visores de documentación cargan sus recursos desde CDN; necesitan conexión a Internet.

**Administrador del seed:** usuario `admin` · contraseña `Admin1234!`. Para entrar como cliente, registrá una cuenta desde la aplicación: el registro siempre crea el rol `user`.

## 3. Frontend

En una **segunda terminal**, dentro de `frontend/`:

```bash
pnpm install
```

Copiar `frontend/.env.example` a `frontend/.env` (`cp .env.example .env` en macOS/Linux o `Copy-Item .env.example .env` en PowerShell).

```bash
pnpm build
pnpm dev
```

Abrir **http://localhost:5173**. `pnpm build` ejecuta primero el chequeo de TypeScript estricto. `pnpm typecheck` permite comprobar solamente los tipos.

Abrir el frontend en **http://localhost:5173** y mantener `VITE_API_URL=http://localhost:8000/api/v1` para que la cookie de sesión se envíe correctamente. Mantener Vite en el puerto 5173 o actualizar `FRONTEND_ORIGIN` si se cambia el puerto. La dirección `127.0.0.1:5433` de `DATABASE_URL` es una conexión independiente entre el backend y PostgreSQL; no cambia las URLs que abre el navegador.

## Variables de entorno

| Archivo | Variable | Valor de desarrollo / propósito |
| --- | --- | --- |
| backend/.env | DATABASE_URL | `postgresql://foodstore:foodstore@127.0.0.1:5433/foodstore_db` |
| backend/.env | SECRET_KEY | Clave propia de al menos 32 caracteres para firmar JWT |
| backend/.env | ALGORITHM | `HS256` |
| backend/.env | ACCESS_TOKEN_EXPIRE_MINUTES | `30` |
| backend/.env | FRONTEND_ORIGIN | `http://localhost:5173` |
| backend/.env | COOKIE_SECURE | `false` para HTTP local; `true` si se usa HTTPS |
| frontend/.env | VITE_API_URL | `http://localhost:8000/api/v1` |

Los `.env` reales no se incluyen en el ZIP ni se suben a Git. Los `.env.example` están completos. Reiniciar el backend después de modificar su configuración y Vite después de modificar las variables del frontend.

## Solución del error de conexión observado en macOS

Si aparece `FATAL: database "foodstore_db" does not exist`, verificar primero la base dentro del contenedor desde la raíz del proyecto:

```bash
docker compose exec db psql -U foodstore -d postgres -c "SELECT datname FROM pg_database;"
docker compose port db 5432
```

Si la base figura en Docker pero el backend falla al conectarse a `localhost:5432` o `127.0.0.1:5432`, está intentando acceder a una instancia diferente. Si `docker compose ps` muestra únicamente `5432/tcp`, el contenedor no está publicando ese puerto hacia la computadora. Aplicar el mapeo `127.0.0.1:5433:5432` y recrear el servicio como se indica en el paso 1.

Una vez confirmado `127.0.0.1:5433`, detener Uvicorn con `Ctrl + C` si estaba corriendo y corregir `backend/.env`. Desde la raíz, volver a ejecutar en macOS:

```bash
cd backend
source .venv/bin/activate
python -m app.db.seed
uvicorn app.main:app --reload
```

Si ya estás dentro de `backend/`, omitir `cd backend`. Al finalizar el arranque debe aparecer `Application startup complete`. La documentación queda disponible en `http://localhost:8000/docs`.

## Recorrido funcional

1. Explorar el catálogo, buscar por nombre y filtrar por categoría. El servidor pagina de a seis productos.
2. Agregar productos al carrito y cambiar cantidades. El carrito permanece al recargar el navegador.
3. Registrarse e iniciar sesión. Confirmar un pedido indicando dirección, efectivo o transferencia y notas opcionales. El pago es manual: no existe pasarela ni datos bancarios inventados.
4. Consultar el detalle en “Mis pedidos”. El cliente puede cancelar un pedido propio únicamente mientras está pendiente.
5. Cerrar sesión e ingresar como administrador. El panel permite crear/editar/dar de baja categorías y productos, modificar stock y disponibilidad, gestionar pedidos y activar/desactivar usuarios.
6. Avanzar un pedido: **PENDIENTE → EN_PREPARACION → ENTREGADO**. También se puede cancelar desde PENDIENTE o EN_PREPARACION como administrador. ENTREGADO y CANCELADO son estados terminales.
7. Verificar la devolución de stock al cancelar y el resumen del negocio. “Pedidos de hoy” se calcula en **UTC**, igual que las fechas almacenadas; las fechas de la interfaz se muestran en la zona local del navegador. Los ingresos corresponden únicamente a pedidos ENTREGADO y son acumulados.

Las tablas administrativas usan TanStack Table con búsqueda, ordenamiento y paginación local. Productos y pedidos se solicitan en bloques de hasta 100 y permiten navegar a bloques adicionales. En sesión de administrador, la API `/pedidos` devuelve todos los pedidos, también desde “Mis pedidos”, de acuerdo con el contrato de la consigna.

## Organización del código

```text
backend/app/
  core/                  Configuración, sesión, seguridad, dependencias, repositorio y UoW base
  modules/auth/          Registro, login, logout y perfil
  modules/usuarios/      Modelo, schemas, repositorio, UoW, servicio y router
  modules/categorias/    Modelo, schemas, repositorio, UoW, servicio y router
  modules/productos/     Modelo, schemas, repositorio, UoW, servicio y router
  modules/pedidos/       Modelos Pedido/DetallePedido y reglas transaccionales
  db/seed.py             Carga inicial idempotente
frontend/src/
  features/              auth, categorias, productos, usuarios y pedidos
  shared/                Cliente Axios, QueryClient, formularios, tablas y UI reutilizable
  store/                 authStore y cartStore con Zustand persist
  routes/                Rutas y ProtectedRoute por rol
```

En cada feature, `api/` contiene las llamadas tipadas, `types/` los contratos y `pages/` las pantallas; `components/` y `hooks/` separan componentes y lógica cuando se reutilizan.

### Decisiones del dominio

- El router recibe HTTP, resuelve los permisos con `Depends` y traduce excepciones de dominio. El service abre el UoW y devuelve schemas dentro de su bloque. Solo `UnitOfWork.__exit__` ejecuta commit, rollback y close.
- Los repositorios consultan y hacen flush; no confirman transacciones ni deciden reglas de negocio.
- Crear un pedido descuenta stock y copia nombre/precio en sus líneas en una misma transacción. Una validación fallida revierte todo. El stock se bloquea por fila en PostgreSQL y en orden de ID para reducir deadlocks.
- Cancelar bloquea el pedido y repone sus productos en la misma transacción, incluso si fueron dados de baja. Una segunda cancelación falla y no repone stock otra vez.
- Los precios y subtotales son `float`, como exige el UML, redondeados a dos decimales al calcular. Las líneas y el total no se editan y los pedidos no se borran.
- Categorías y productos tienen baja lógica. Una categoría inactiva no libera su nombre ni oculta sus productos. Los productos conservan su categoría histórica; para asignar otra, debe estar activa.
- El JWT se envía exclusivamente en la cookie **HttpOnly** `access_token`, SameSite=Lax. Axios usa `withCredentials`. La aplicación nunca lee ni persiste el token.
- `authStore` persiste solo los datos públicos del usuario y verifica `/auth/me` al iniciar. `cartStore` persiste el carrito. TanStack Query administra los datos del servidor y sus invalidaciones.
- La API verifica sesión y rol en cada operación protegida, además de las protecciones visuales de React.

## Endpoints

Todos bajo `/api/v1`; contratos detallados en `/docs` y `/redoc`.

| Módulo | Operaciones |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/token`, `POST /auth/logout`, `GET /auth/me` |
| Usuarios | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` |
| Categorías | `GET/POST /categorias`, `GET/PUT/DELETE /categorias/{id}` |
| Productos | `GET/POST /productos`, `GET/PUT/DELETE /productos/{id}`, `PATCH /productos/{id}/stock` |
| Pedidos | `GET/POST /pedidos`, `GET /pedidos/resumen`, `GET /pedidos/{id}`, `PATCH /pedidos/{id}/estado`, `PATCH /pedidos/{id}/cancelar` |

El login recibe un **formulario** con `username` y `password`, no JSON. Devuelve `{"message":"Login exitoso"}` y establece la cookie. Los listados paginados reciben `skip` y `limit` (1 a 100). Productos admite `search`, `categoria_id` y `disponible`; pedidos admite `estado`. PUT actualiza solo los campos enviados. DELETE devuelve 204 sin cuerpo. Los errores responden `detail` con los códigos exigidos: 400, 401, 403, 404, 409 y 422.
