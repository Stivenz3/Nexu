# Certificados Nexu — Implementación y guía para el equipo

Módulo **completo** en frontend + Firestore (emisión, PDF, QR, verificación pública).

> **Índice general:** [docs/README.md](./README.md)  
> **Lecciones y seed:** [DESARROLLO_LECCIONES.md](./DESARROLLO_LECCIONES.md) — quien agrega L2–L5 solo debe asegurar examen + `lessonId`; este módulo no se reescribe.

---

## 1. ¿Qué está hecho vs qué falta?

| Hecho | Pendiente (fase 2) |
|-------|---------------------|
| Crear certificado al aprobar examen (≥ 70 %) | Cloud Function para emitir (más seguro) |
| Firestore `certificates` + `certificatePublic` | Subir PDF a Storage (`pdfUrl`) |
| Página `/certificado` con datos reales | Revocación admin (`isValid: false`) |
| Descargar PDF (cliente) | Email al emitir |
| QR con URL real | Certificados por empresa (`companyId`) |
| `/verificar/:code` sin login | Panel admin |

**Quien desarrolla lecciones nuevas:** no debe tocar este módulo salvo pruebas E2E. Ver §9.

---

## 2. Flujo completo

```
Usuario aprueba evaluación final (≥ 70 %)
        ↓
LessonExamPage → issueCertificate()
        ↓
Firestore: /certificates/{certificateId}
           /certificatePublic/{verifyCode}
        ↓
Redirige a /certificado
        ↓
CertificatePage: vista + Descargar PDF + Compartir enlace
        ↓
Cualquiera escanea QR o abre /verificar/{verifyCode}
        ↓
VerificationPage (sin login) lee certificatePublic
```

---

## 3. Colecciones Firestore

### `/certificates/{certificateId}` (privado)

Solo el dueño (`userId == auth.uid`) puede leer. Solo **create** desde la app al aprobar (no update/delete).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| certificateId | string | Mismo que el ID del documento |
| userId | string | UID Firebase Auth |
| lessonId | string | ej. `lesson_01_higiene_personal` |
| lessonTitle | string | Título desnormalizado |
| courseName | string | `"Buenas Prácticas de Manufactura"` |
| userName | string | Nombre completo |
| userDocument | string | ej. `CC. 123456789` |
| finalScore | number | 0–100 |
| verifyCode | string | ej. `NX-AB12CD34EF` |
| qrVerifyUrl | string | URL completa de verificación |
| issuedAt | timestamp | Fecha emisión |
| expiresAt | timestamp | +1 año |
| isValid | boolean | `true` (revocado = false en futuro) |
| companyId | null | Reservado empresas |

### `/certificatePublic/{verifyCode}` (público)

**Lectura sin autenticación** (`allow read: if true`). ID del documento = código de verificación.

Contiene datos **enmascarados** (documento parcial) para la página pública.

---

## 4. Archivos del código (mapa)

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/types/certificate.ts` | Tipos Firestore y vista UI |
| `src/services/certificateService.ts` | Crear, listar, verificar |
| `src/lib/verifyUrl.ts` | Armar URL `/verificar/{code}` |
| `src/lib/certificatePdf.ts` | Exportar DOM → PDF (html2canvas + jsPDF) |
| `src/components/certificate/CertificateDocument.tsx` | Vista del certificado + QR real |
| `src/pages/LessonExamPage.tsx` | Llama `issueCertificate` al aprobar |
| `src/pages/CertificatePage.tsx` | Lista certificados del usuario, PDF, compartir |
| `src/pages/VerificationPage.tsx` | Consulta pública por código |
| `firestore.rules` | Reglas `certificates` y `certificatePublic` |
| `firestore.indexes.json` | Índice `userId` + `issuedAt` |

---

## 5. Funciones principales (`certificateService.ts`)

```typescript
issueCertificate(input)     // Crea o devuelve existente (1 cert por lección/usuario)
getUserCertificates(userId) // Lista ordenada por fecha
getCertificateById(id)      // Un certificado
getCertificateByLesson(userId, lessonId)
getPublicVerification(verifyCode) // Página pública
```

**Idempotencia:** si el usuario ya tiene certificado para esa `lessonId`, `issueCertificate` no duplica; devuelve el existente.

**Input al emitir** (desde `LessonExamPage`):

```typescript
{
  userId, lessonId, lessonTitle, finalScore,
  userName, userDocument, documentType, documentNumber,
  companyId?: null
}
```

---

## 6. PDF

1. El HTML del certificado está en `#nexu-certificate-document` (`CertificateDocument.tsx`).
2. `downloadCertificatePdf()` captura ese nodo con **html2canvas** y genera PDF A4 horizontal con **jsPDF**.
3. Botón en `CertificatePage` → `Nexu_Certificado_{nombre}_{codigo}.pdf`.

No se sube PDF a Firebase Storage (campo `pdfUrl` reservado para fase 2).

---

## 7. QR y verificación

- Al crear el certificado: `qrVerifyUrl = {origen}/verificar/{verifyCode}`.
- QR generado con librería `qrcode` (Data URL en el componente).
- Ruta app: `/verificar/:code` → `VerificationPage`.

**Producción:** variable opcional `VITE_APP_URL` en Vercel (URL pública). Si no está, en el navegador usa `window.location.origin`.

---

## 8. Reglas Firestore — desplegar

Tras cambiar reglas o índices:

```powershell
npm run firebase:deploy:rules
```

Índice compuesto: `certificates` — `userId` + `issuedAt` (en `firestore.indexes.json`).

---

## 9. Cuando agreguen lección 2, 3… (para devs de lecciones)

| Acción | ¿Necesario? |
|--------|-------------|
| Cambiar `certificateService.ts` | No |
| Cambiar `CertificatePage` / PDF / QR | No |
| Aprobar examen con `lessonId` y `lessonTitle` correctos en `LessonExamPage` | **Sí** (ya parametrizado por ruta) |
| Tener lección en Firestore con examen | **Sí** |
| Probar: aprobar → `/certificado` → PDF → `/verificar/código` | **Sí** (checklist en PR) |

Resultado: **un certificado por lección por usuario**; `CertificatePage` muestra selector si hay varios.

**No hacer:** volver a mock en `CertificatePage`; no duplicar lógica de emisión en otro archivo.

---

## 10. Cómo probar

1. Iniciar sesión en la app.
2. Completar lección 1 y aprobar evaluación (≥ 70 %).
3. Debe redirigir a `/certificado` con nota real.
4. **Descargar PDF** y abrir el archivo.
5. Copiar enlace o QR → `/verificar/NX-...`.
6. Abrir en incógnito (sin login).

**Firebase Console:** colecciones `certificates` y `certificatePublic`.

---

## 11. Checklist — mantenimiento certificados (PR)

- [ ] Reglas desplegadas si tocaste `firestore.rules`.
- [ ] `VITE_APP_URL` en Vercel si el QR debe apuntar al dominio de producción.
- [ ] No exponer `userDocument` completo en `certificatePublic` (solo enmascarado).
- [ ] Build pasa: `npm run build`.
- [ ] `pnpm-lock.yaml` actualizado si añadiste deps.

---

## 12. Dependencias npm

- `jspdf` — generación PDF  
- `html2canvas` — captura del certificado HTML  
- `qrcode` — código QR  

No van en `scripts/`; son del frontend (Vercel las instala con pnpm).

---

## 13. Enlaces

- [Índice equipo](./README.md)
- [Desarrollo lecciones](./DESARROLLO_LECCIONES.md)
- [Seed lección 1](../firestore-seed/README.md)

*Módulo implementado en el repo Nexu · mantener este doc al cambiar el flujo de certificación.*
