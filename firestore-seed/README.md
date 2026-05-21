# Seed Firestore — Contenido de lecciones

Los **JSON aquí son la fuente de verdad** del contenido pedagógico. El script de seed los sube a Firebase; la app solo lee.

> **Índice equipo:** [docs/README.md](../docs/README.md)  
> **Guía completa lecciones:** [docs/DESARROLLO_LECCIONES.md](../docs/DESARROLLO_LECCIONES.md)  
> **Certificados (no usa seed):** [docs/CERTIFICADOS.md](../docs/CERTIFICADOS.md)

---

## Carpetas por lección

| Carpeta | Estado | `lessonId` |
|---------|--------|------------|
| `lesson_01/` | En producción Firebase | `lesson_01_higiene_personal` |
| `lesson_02/` | Pendiente — crear equipo | ej. `lesson_02_...` |
| `lesson_03/` … | Pendiente | — |

Cada carpeta debe tener:

1. `lesson.json` — metadatos (`title`, `order`, `isActive`, `totalBlocks`, …)
2. `blocks.json` — array de bloques (`b01_video` … `b08_exam` típico)
3. `questions.json` — intercaladas (`q_p1i` …) + examen (`q_e01` … `q_e15`)

Copiar estructura desde `lesson_01/`. **No inventar** textos; salir del PDF técnico de la lección.

---

## Lección 1 — seed disponible

```powershell
npm run seed:lesson1
```

**Qué hace:** borra y recrea solo `lessons/lesson_01_higiene_personal` (+ blocks + questions). **No** borra usuarios ni certificados.

---

## Lección 2+ — qué debe hacer el equipo

1. Crear `firestore-seed/lesson_02/` con los tres JSON.
2. Copiar `scripts/seed-lesson1.mjs` → `scripts/seed-lesson2.mjs` (cambiar `LESSON_ID` y carpeta).
3. Añadir en `package.json`: `"seed:lesson2": "npm install --prefix scripts && node scripts/seed-lesson2.mjs"` (o script unificado con argumento).
4. Coordinar en el chat antes de ejecutar seed en `nexu-156ce`.
5. Completar checklist en [DESARROLLO §12](../docs/DESARROLLO_LECCIONES.md#12-checklist--entregar-una-lección-nueva-copiar-en-pr).

---

## Comandos de consola (detalle)

Explicación de `firebase login`, `gcloud auth application-default login` y errores:

**[docs/DESARROLLO_LECCIONES.md §7](../docs/DESARROLLO_LECCIONES.md#7-comandos-de-consola-qué-hace-cada-uno)**

Secuencia rápida:

```powershell
npx firebase login
npx firebase use nexu-156ce
gcloud auth application-default login
npm run seed:lesson1
```

Salida esperada L1: `Listo: 1 lección, 8 bloques, 23 preguntas.`

Reglas (si editaste `firestore.rules`):

```powershell
npm run firebase:deploy:rules
```

---

## Convenciones de IDs

| Elemento | Convención |
|----------|------------|
| Lección | `lesson_02_nombre_corto` |
| Bloques | `b01_video`, `b02_modulo_a`, … |
| Preguntas intercaladas | `q_p1i`, `q_p2i`, … |
| Preguntas examen | `q_e01` … `q_e15` |

Los `blockRef` en preguntas deben coincidir con `blockId` del bloque correspondiente.

---

## No confundir

| Acción | ¿Afecta certificados de alumnos? |
|--------|-----------------------------------|
| `seed:lesson1` | No |
| `seed:lesson2` | No |
| Editar JSON y re-seed L1 | Sí actualiza preguntas/teoría para todos |
| Deploy Vercel | No (solo frontend) |
