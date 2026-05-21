# Nexu — Certificación BPM Digital

Plataforma web de capacitación en Buenas Prácticas de Manufactura (BPM) para manipuladores de alimentos (Colombia, Res. 2674 de 2013).

---

## Para el equipo de desarrollo — leer primero

**[docs/README.md](docs/README.md)** — índice maestro: arquitectura, qué está listo, backlog, rutas, convenciones Git, división de trabajo.

| Documento | Contenido |
|-----------|-----------|
| [docs/README.md](docs/README.md) | **Entrada principal** — empieza aquí |
| [docs/DESARROLLO_LECCIONES.md](docs/DESARROLLO_LECCIONES.md) | Lecciones, Firestore, seed, CLI |
| [docs/CERTIFICADOS.md](docs/CERTIFICADOS.md) | Certificados, PDF, QR, verificación |
| [firestore-seed/README.md](firestore-seed/README.md) | Datos JSON y comandos seed |

---

## Inicio rápido (local)

```powershell
npm install
# Opcional: copiar .env.example → .env.local (proyecto nexu-156ce)
npm run dev
```

La lección 1 **ya está en Firebase**; no hace falta seed para probar como alumno.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | App en local |
| `npm run build` | Build (igual que Vercel) |
| `npm run seed:lesson1` | Subir/reemplazar lección 1 en Firestore |
| `npm run firebase:deploy:rules` | Publicar reglas e índices Firestore |

Vercel usa **pnpm**; tras cambiar dependencias: `pnpm install --lockfile-only` y commit de `pnpm-lock.yaml`.

---

## Producción

- Frontend: Vercel (variables `VITE_FIREBASE_*` en el dashboard).
- Datos: Firebase `nexu-156ce` (compartido con local).
- Tras cambiar reglas: `npm run firebase:deploy:rules`.
- Opcional certificados/QR: `VITE_APP_URL` = URL pública de la app.
