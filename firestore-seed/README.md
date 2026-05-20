# Seed Firestore — Lección 1

## Contenido

- `lesson_01/lesson.json` — documento `/lessons/lesson_01_higiene_personal`
- `lesson_01/blocks.json` — 8 bloques en `/lessons/.../blocks/`
- `lesson_01/questions.json` — 23 preguntas en `/lessons/.../questions/`

## Desplegar reglas (ya configurado en el proyecto)

```powershell
npm run firebase:deploy:rules
```

## Poblar la base de datos

1. Inicia sesión en Firebase CLI:

```powershell
npx firebase login
npx firebase use nexu-156ce
```

2. Credenciales para el Admin SDK (elige una opción):

```powershell
gcloud auth application-default login
```

O coloca un JSON de cuenta de servicio y define:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="ruta\a\serviceAccountKey.json"
```

3. Ejecuta el seed (instala `firebase-admin` solo en `scripts/`, no en el build de Vercel):

```powershell
npm run seed:lesson1
```

Para reglas de Firestore sin instalar CLI global:

```powershell
npm run firebase:deploy:rules
```

Deberías ver: `Listo: 1 lección, 8 bloques, 23 preguntas.`
