# Lección 2 — Plantilla (pendiente de contenido)

Copia la estructura de `../lesson_01/` y rellena desde el PDF técnico del módulo 2.

## Pasos

1. Editar `lesson.json`: `lessonId` único (ej. `lesson_02_control_temperaturas`), `title`, `order: 2`, `totalBlocks`, `isActive: true` cuando esté listo.
2. Completar `blocks.json` (mismo esquema que L1: `b01_video` … `b08_exam`).
3. Completar `questions.json` (intercaladas + examen final).
4. Coordinar con el equipo y ejecutar:

```powershell
npm run seed:lesson2
```

El script **rechaza** `blocks.json` vacío hasta que haya al menos un bloque.

## Referencia

- [docs/DESARROLLO_LECCIONES.md](../../docs/DESARROLLO_LECCIONES.md)
- Ejemplo completo: `../lesson_01/`
