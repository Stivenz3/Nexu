# Guía para el equipo de desarrollo — Lecciones Nexu y Firestore

Documento para trabajar **igual que la Lección 1** (Higiene Personal). Proyecto Firebase: `nexu-156ce`.

> **Índice general del equipo:** [docs/README.md](./README.md) (arquitectura, backlog completo, rutas, quién hace qué).  
> **Certificados (ya implementado):** [CERTIFICADOS.md](./CERTIFICADOS.md) — no rehacer; solo integrar nuevas lecciones al aprobar examen.

---

## 1. Qué funciona hoy y qué no

### Funciona

| Área | Detalle |
|------|---------|
| Autenticación | Registro, login, perfil en `/users/{uid}` |
| Ruta de aprendizaje | Lista lecciones activas desde Firestore |
| Lección 1 completa | 8 bloques en orden con progreso por usuario |
| Video | YouTube embebido; en desarrollo no exige % mínimo visto |
| Teoría + preguntas | 8 preguntas intercaladas (`q_p1i` … `q_p8i`) |
| Minijuego | Placeholder: lista de 6 errores para marcar (sin escena 3D aún) |
| Evaluación final | 15 preguntas aleatorias del banco (`q_e01` … `q_e15`), umbral 70 % |
| Progreso | Se guarda en `/users/{uid}/lessonProgress/{lessonId}` |
| Reglas Firestore | Lectura de lecciones autenticado; solo el dueño escribe su progreso |
| Certificados | Emisión al aprobar, PDF, QR, `/verificar/{código}` — ver [CERTIFICADOS.md](./CERTIFICADOS.md) |

### No funciona / no está implementado

| Área | Estado |
|------|--------|
| Lecciones 2–5 | No hay datos en Firestore; no aparecen en la ruta |
| Certificado PDF en Storage | PDF se genera en cliente; no hay `pdfUrl` en Storage |
| Cloud Function emisión | Emisión desde cliente al aprobar examen (ver [CERTIFICADOS.md](./CERTIFICADOS.md)) |
| Cloud Functions | No hay función al aprobar examen |
| Video 80 % obligatorio | `minWatchPercent` está en 0 en la lección 1 |
| Unity / Three.js cocina | Minijuego es UI provisional |
| Empresas (`/companies`) | Modelo definido, sin UI |
| Notificaciones / Ajustes | Quitados del menú (no había backend) |
| Dashboard separado | Era duplicado de “Ruta”; solo queda **Ruta de aprendizaje** |

---

## 2. Flujo del usuario (Lección 1)

```
Login → /ruta → Empezar lección
         ↓
/leccion/lesson_01_higiene_personal
         ↓
[b01] Video
         ↓
[b02–b06] Teoría → pregunta(s) intercalada(s) por bloque
         ↓
[b07] Minijuego (6 errores)
         ↓
[b08] Pantalla “Iniciar evaluación”
         ↓
/leccion/lesson_01_higiene_personal/evaluacion  (15 preguntas)
         ↓
Si ≥ 70 % → issueCertificate() → /certificado (datos reales en Firestore)
Si < 70 % → vuelve a la lección
```

Cada bloque se desbloquea cuando el **anterior** tiene `completed: true` en el progreso del usuario.

---

## 3. Firestore en pocas palabras (para quien viene de SQL)

No hay tablas ni JOINs. Hay **colecciones** (carpetas) y **documentos** (archivos JSON con ID).

```
lessons/                          ← colección
  lesson_01_higiene_personal/     ← documento (metadatos de la lección)
    blocks/                       ← subcolección
      b01_video/                  ← documento
      b02_modulo_a/
      ...
    questions/                    ← subcolección
      q_p1i/
      q_e01/
      ...

users/
  {firebaseAuthUid}/
    lessonProgress/
      lesson_01_higiene_personal/  ← progreso de ESE usuario en ESA lección
```

- **Contenido de curso** (`lessons`, `blocks`, `questions`): lo cargas tú con el **seed**; la app solo **lee**.
- **Progreso** (`lessonProgress`): lo **crea y actualiza la app** cuando el usuario avanza.

---

## 4. Cómo agregar una lección nueva (mismo proceso que la 1)

### Paso A — Archivos JSON (fuente de verdad)

En `firestore-seed/lesson_XX/` crea:

1. `lesson.json` — un documento raíz  
2. `blocks.json` — array de 8 bloques (o los que definan el diseño)  
3. `questions.json` — intercaladas + evaluación final  

Copia la estructura de `firestore-seed/lesson_01/`. Los IDs deben ser consistentes:

| Tipo | Convención ejemplo |
|------|-------------------|
| Lección | `lesson_02_control_temperaturas` |
| Bloques | `b01_video`, `b02_modulo_a`, … |
| Preguntas intercaladas | `q_p1i`, `q_p2i`, … |
| Preguntas examen | `q_e01`, … `q_e15` |

El contenido sale del PDF/documento técnico; **no inventar** textos ni respuestas.

### Paso B — Subir a Firestore

Sigue la secuencia de la **sección 7** (comandos de consola). Resumen:

1. `npx firebase login`  
2. `npx firebase use nexu-156ce`  
3. `gcloud auth application-default login`  
4. `npm run seed:lesson1`  
5. Si cambias reglas: `npm run firebase:deploy:rules`

### Paso C — Frontend

| Archivo | Qué hacer |
|---------|-----------|
| `src/types/lesson.ts` | Tipos ya sirven; solo ajusta si hay campos nuevos |
| `src/services/lessonService.ts` | Sin cambios si la estructura es igual |
| `src/services/progressService.ts` | Progreso inicial **dinámico** desde bloques Firestore (§4.1) |
| `LearningPathPage` | Muestra lección si `isActive: true`; desbloqueo: lección anterior `passed` |
| Bloques UI | `VideoBlockView`, `TheoryBlockView`, `GameBlockView`, examen — reutilizables |
| `LessonExamPage` | Ya emite certificado al aprobar; `lessonId` y bloque examen por ruta |
| `Sidebar.tsx` | Evaluación → lección en pantalla o última desbloqueada |

### Paso D — Certificado (automático)

Si el alumno aprueba el examen final, **no hace falta código extra en el módulo de certificados**. `LessonExamPage` llama `issueCertificate()`. Ver [CERTIFICADOS.md](./CERTIFICADOS.md).

### 4.1 Progreso del usuario (dinámico)

`ensureLessonProgress(userId, lessonId, blocks?)` construye `blocksProgress` con `buildBlocksProgress()` según el **tipo** de cada bloque en Firestore (`video`, `theory`, `game`, `exam`).

- Teoría con varias preguntas: array `questionsAnswered` según `questionIds` del bloque.
- Examen final: `saveExamResult` localiza el bloque `type === 'exam'` (no asume `b08_exam`).

Alumnos que ya tenían progreso de L1 **no se migran**; se sigue usando su documento existente. Solo usuarios **nuevos** en una lección reciben la plantilla generada desde sus bloques.

### Paso E — Probar en local

```powershell
npm install
# .env.local con VITE_FIREBASE_* de nexu-156ce (o sin .env en dev usa fallback)
npm run dev
```

Misma base Firebase = mismos datos que producción (cuidado al hacer pruebas destructivas).

---

## 5. Tipos de bloque (`blocks.type`)

| type | Contenido principal | UI |
|------|---------------------|-----|
| `video` | `youtubeUrl`, `minWatchPercent`, `durationSeconds` | `VideoBlockView` |
| `theory` | `summary`, `keyPoints`, `questionId` o `questionIds[]` | `TheoryBlockView` + `InlineQuestionView` |
| `game` | `errors[]`, `scoring`, `timeLimitSeconds` | `GameBlockView` (placeholder) |
| `exam` | `totalQuestions`, `passingPercent`, `randomize` | Redirige a `LessonExamPage` |

---

## 6. Preguntas (`questions`)

Cada documento incluye:

- `questionType`: `intercalada` | `evaluacion_final`
- `blockRef`: bloque al que pertenece (ej. `b04_modulo_c` o `b08_exam`)
- `options`: array `{ label: "A", text: "...", isCorrect: true/false }`
- `explanation`, `normativeRef`, `difficulty`

La app **muestra** las opciones; hoy la corrección es en cliente (para producción fuerte conviene validar en backend más adelante).

---

## 7. Comandos de consola: qué hace cada uno

Esta es la secuencia que usa el equipo para **escribir contenido de lecciones en Firestore** desde la PC. Ser **propietario (Owner)** del proyecto en Firebase/Google Cloud significa que tu cuenta Google ya tiene permiso; estos comandos solo **identifican tu cuenta en la máquina** para que las herramientas puedan actuar en tu nombre.

### Vista general: tres capas distintas

```
┌─────────────────────────────────────────────────────────────────┐
│  TU CUENTA GOOGLE (propietario en consola.firebase.google.com) │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 npx firebase login    gcloud auth application-    npm run seed:lesson1
                       default login
        │                       │                       │
        │                       │                       │
 Autentica la CLI        Credenciales para          Lee JSON locales y
 de Firebase (deploy,    scripts Node en tu PC      escribe en Firestore
 use, emulators)         (firebase-admin)           (proyecto nexu-156ce)
```

| Comando | Herramienta | Para qué sirve en Nexu |
|---------|-------------|----------------------|
| `npx firebase login` | Firebase CLI | Confirmar en terminal qué cuenta Google usas con Firebase |
| `gcloud auth application-default login` | Google Cloud SDK | Permitir que el **script de seed** escriba en Firestore desde Node |
| `npm run seed:lesson1` | Script del repo | Subir lección 1 desde `firestore-seed/lesson_01/` a la nube |

**Importante:** los tres no hacen lo mismo. El seed **no usa** la sesión de `firebase login` directamente; usa las credenciales de `gcloud application-default`. Aun así, conviene tener ambos configurados.

---

### 7.1 `npx firebase login`

**Qué hace**

- Abre el navegador para iniciar sesión con tu cuenta Google.
- Guarda un token en tu PC para que los comandos `firebase ...` sepan quién eres.
- No modifica datos de Firestore por sí solo.

**Cuándo ejecutarlo**

- La primera vez que uses Firebase CLI en esa computadora.
- Si cambias de cuenta Google o el CLI dice que la sesión expiró.

**Después conviene fijar el proyecto activo**

```powershell
cd ruta\al\repo\Nexu
npx firebase use nexu-156ce
```

Así la CLI apunta al proyecto **Nexu** (mismo que `VITE_FIREBASE_PROJECT_ID` y `.firebaserc`).

**Relación con ser propietario**

- En [Firebase Console](https://console.firebase.google.com) → proyecto `nexu-156ce` → Configuración → Usuarios y permisos, tu correo debe aparecer como **Owner** o **Editor**.
- `firebase login` solo vincula **tu** correo con la CLI; el permiso real viene de ese rol en la consola.

**Qué NO hace**

- No instala dependencias del proyecto.
- No sube lecciones (eso es `npm run seed:lesson1`).
- No despliega la web en Vercel.

---

### 7.2 `gcloud auth application-default login`

**Qué hace**

- Guarda credenciales locales llamadas **Application Default Credentials (ADC)**.
- Ruta típica en Windows: `%APPDATA%\gcloud\application_default_credentials.json`.
- Cualquier script en tu máquina que use el SDK de Google (aquí: `firebase-admin`) puede decir: “actúa como este usuario”.

**Por qué el seed lo necesita**

El archivo `scripts/seed-lesson1.mjs` contiene:

```javascript
initializeApp({
  credential: applicationDefault(),
  projectId: 'nexu-156ce',
})
```

`applicationDefault()` lee exactamente las credenciales que crea este comando. Sin ellas verás:

```text
Could not load the default credentials...
```

**Cuándo ejecutarlo**

- Una vez por computadora (o cuando expire / cambies de cuenta).
- **Antes** de `npm run seed:lesson1` si el seed falló por credenciales.
- Usa la **misma cuenta Google** que tiene permisos en `nexu-156ce` (la de propietario del equipo).

**Diferencia con `firebase login`**

| | `firebase login` | `gcloud auth application-default login` |
|--|------------------|----------------------------------------|
| Lo usa | Comando `firebase deploy`, `firebase use` | Script Node `seed-lesson1.mjs` |
| Credencial | Token Firebase CLI | ADC de Google Cloud |
| Obligatorio para seed | No (pero recomendado tenerlo) | **Sí** |

**Qué NO hace**

- No abre la app web ni inicia sesión de alumnos en la plataforma.
- No reemplaza las variables `VITE_FIREBASE_*` del frontend.

---

### 7.3 `npm run seed:lesson1`

**Qué hace por dentro** (definido en `package.json`)

1. `npm install --prefix scripts` → instala `firebase-admin` solo en la carpeta `scripts/` (no ensucia el build de Vercel).
2. `npm run seed --prefix scripts` → ejecuta `scripts/seed-lesson1.mjs`.

**Qué hace el script en Firestore** (proyecto `nexu-156ce`)

1. **Borra** la lección 1 anterior (si existía):
   - Todos los documentos en `lessons/lesson_01_higiene_personal/blocks/`
   - Todos los documentos en `lessons/lesson_01_higiene_personal/questions/`
   - El documento `lessons/lesson_01_higiene_personal`
2. **Crea de nuevo** leyendo los JSON del repo:
   - `firestore-seed/lesson_01/lesson.json` → 1 documento de lección
   - `firestore-seed/lesson_01/blocks.json` → 8 bloques
   - `firestore-seed/lesson_01/questions.json` → 23 preguntas

**Salida esperada**

```text
Eliminando datos previos de la lección 1...
Insertando lección, bloques y preguntas...
Listo: 1 lección, 8 bloques, 23 preguntas.
```

**Qué NO toca**

- Cuentas de usuarios (`/users/...`).
- Progreso de alumnos (`lessonProgress`).
- Reglas de seguridad (`firestore.rules`) — para eso está `npm run firebase:deploy:rules`.
- Hosting / Vercel.

**Cuándo ejecutarlo**

| Situación | ¿Correr seed? |
|-----------|----------------|
| Editaste JSON en `firestore-seed/lesson_01/` y quieres ver cambios en la app | **Sí** |
| Clonaste el repo en una PC nueva y Firestore está vacío | **Sí** |
| Solo cambiaste CSS o componentes React | **No** |
| Solo hiciste `git push` a Vercel | **No** (Vercel no corre seed) |
| Un compañero ya corrió seed y tú solo desarrollas UI | **No** (compartís la misma base en la nube) |

**Cuidado en equipo**

- El seed **sobrescribe** el contenido de la lección 1 en Firebase para **todos** (local, producción, compañeros), porque es un solo proyecto `nexu-156ce`.
- Coordinen en el chat antes de correr seed si alguien está probando contenido distinto.
- El progreso personal de cada dev **no se borra** al hacer seed.

---

### 7.4 Secuencia recomendada (primera vez en una PC)

Desde la raíz del repositorio Nexu:

```powershell
# 1) Dependencias del frontend
npm install

# 2) Cuenta para Firebase CLI (deploy de reglas, etc.)
npx firebase login
npx firebase use nexu-156ce

# 3) Credenciales para el script de seed
gcloud auth application-default login

# 4) Subir lección 1 a Firestore
npm run seed:lesson1

# 5) (Opcional) Publicar reglas si las editaste en firestore.rules
npm run firebase:deploy:rules

# 6) Probar la app
npm run dev
```

**Requisitos previos en la máquina**

- Node.js 18+ y npm.
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` en PATH) para el paso 3.
- Cuenta Google del equipo con rol Owner/Editor en `nexu-156ce`.

---

### 7.5 Comando extra: `npm run firebase:deploy:rules`

**Qué hace**

- Ejecuta `npx firebase-tools deploy --only firestore:rules,firestore:indexes`.
- Sube `firestore.rules` y `firestore.indexes.json` al proyecto Firebase.
- Define **quién puede leer/escribir** qué colección (no es contenido de lecciones).

**Cuándo**

- Después de cambiar `firestore.rules` o índices.
- No hace falta en cada seed de lección.

**Requiere**

- `npx firebase login` y proyecto `nexu-156ce` activo.

---

### 7.6 Errores frecuentes y solución

| Mensaje | Causa probable | Qué hacer |
|---------|----------------|-----------|
| `Could not load the default credentials` | Falta paso 7.2 | `gcloud auth application-default login` |
| `PERMISSION_DENIED` en seed | Cuenta sin rol en el proyecto | Verificar Owner/Editor en Firebase Console con el mismo correo de gcloud |
| `ERR_PNPM_OUTDATED_LOCKFILE` en Vercel | `package.json` cambió sin actualizar pnpm-lock | `pnpm install --lockfile-only` y commit del lockfile |
| La app no muestra la lección | Seed no corrido o proyecto Firebase distinto | Confirmar `nexu-156ce` en `.env.local` y volver a seed |
| `firebase: command not found` | CLI no instalada globalmente | Usar siempre `npx firebase ...` o `npm run firebase:deploy:rules` |

---

### 7.7 Qué usa la app en el navegador (no confundir)

| Contexto | Autenticación |
|----------|----------------|
| Alumno en `nexu.app` / localhost | Firebase **Auth** (email/contraseña) + reglas Firestore |
| Dev ejecutando seed en terminal | **gcloud ADC** + cuenta propietario |
| Deploy en Vercel | Solo build del frontend; variables `VITE_FIREBASE_*` |

La app **nunca** ejecuta el seed; solo **lee** `lessons`, `blocks` y `questions` si el usuario está logueado.

---

## 8. Scripts npm (resumen)

| Comando | Uso |
|---------|-----|
| `npm run dev` | App local |
| `npm run build` | Compilar (igual que Vercel) |
| `npm run seed:lesson1` | Poblar `lesson_01` (ver sección 7) |
| `npm run seed:lesson2` | Poblar `lesson_02` cuando el JSON esté completo |
| `npm run firebase:deploy:rules` | Publicar reglas e índices |

Vercel **no** ejecuta el seed; solo despliega el frontend. Los datos viven en Firebase `nexu-156ce` y los comparte todo el equipo.

---

## 9. Variables de entorno

En Vercel y en `.env.local` (ver `.env.example`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Todos deben apuntar a **`nexu-156ce`** para ver la lección 1.

Opcional (certificados / QR en producción):

- `VITE_APP_URL` — URL pública de la app (ej. `https://tu-dominio.vercel.app`). Si falta, el QR usa el origen del navegador o el fallback en `verifyUrl.ts`.

---

## 10. Convenciones de ramas y commits

1. JSON de lección en `firestore-seed/lesson_XX/`  
2. Seed probado en Firebase de desarrollo  
3. Cambios de UI/servicios en `src/`  
4. No commitear `.env`, `dist/`, ni `scripts/node_modules/`  
5. Lockfile: el repo usa **pnpm** en Vercel; tras cambiar `package.json`, ejecutar `pnpm install --lockfile-only` o no añadir deps pesadas al raíz (seed va en `scripts/package.json`)

---

## 11. Referencia rápida Lección 1

| Dato | Valor |
|------|--------|
| `lessonId` | `lesson_01_higiene_personal` |
| Bloques | 8 (`b01_video` … `b08_exam`) |
| Preguntas | 23 (8 intercaladas + 15 examen) |
| Ruta app | `/leccion/lesson_01_higiene_personal` |
| Examen | `/leccion/lesson_01_higiene_personal/evaluacion` |

Archivos de seed: `firestore-seed/lesson_01/`.

---

## 12. Checklist — entregar una lección nueva (copiar en PR)

- [ ] Carpeta `firestore-seed/lesson_XX/` con `lesson.json`, `blocks.json`, `questions.json` validados contra el PDF.
- [ ] Script de seed creado o parametrizado (`npm run seed:lessonX`) y ejecutado en `nexu-156ce` (coordinado con el equipo).
- [ ] `lesson.isActive: true` y `order` coherente con desbloqueo en `/ruta`.
- [ ] Progreso: probar con usuario nuevo en esa lección (§4.1 automático).
- [ ] Prueba manual: video → teoría → preguntas → juego → examen → certificado.
- [ ] Reglas Firestore desplegadas si hubo cambios: `npm run firebase:deploy:rules`.
- [ ] Sin commitear `.env` ni `dist/`.

---

## 13. Estructura de un bloque (referencia rápida)

| type | Campos clave en `content` |
|------|---------------------------|
| `video` | `youtubeUrl`, `minWatchPercent`, `durationSeconds` |
| `theory` | `summary`, `keyPoints`, `questionId` o `questionIds[]`, `normativeRef` |
| `game` | `errors[]`, `scoring.passingScore`, `timeLimitSeconds` |
| `exam` | `totalQuestions`, `passingPercent`, `randomize` |

Preguntas en subcolección `questions/`, no dentro del bloque (excepto referencia por ID).

---

## 14. Enlaces

- [Índice equipo](./README.md)
- [Certificados](./CERTIFICADOS.md)
- [Seed L1](../firestore-seed/README.md)

¿Dudas? Revisar `src/services/lessonService.ts`, `progressService.ts`, `src/pages/LessonFlowPage.tsx`, `LessonExamPage.tsx`.

