# Debug Session: admin-lessons
**Status:** [OPEN]  
**Session ID:** admin-lessons  
**Created:** 2026-09-07  
**Symptoms:** 4 bugs: (1) crash null .get() digest 2169918753, (2) video source persistence, (3) Anteprima 404 draft, (4) slug/module integrity

## Hypotheses
1. H1: `searchParams` in page.tsx è null durante SSR Vercel, causando `.get()` su null (Next.js 15 params/searchParams as Promise)
2. H2: `headers()` o `cookies()` chiamati dentro una funzione che ritorna null in alcuni path di auth
3. H3: `videoSourceType` field o suoi mapping formData ↔ Prisma enum sono disallineati o il parsing scarta valori
4. H4: Anteprima 404 perché la route member esclude DRAFT dal where clause Prisma e l'admin non ha bypass
5. H5: Module slug duplicato o order=0 causa mismatch nella costruzione href di preview

## Evidence Log
| Timestamp | Event | Details |
|-----------|-------|---------|
| - | - | - |

## Files Inspected
- [ ] src/app/admin/corsi/[slug]/lezioni/[lessonId]/page.tsx
- [ ] LessonEditor / AdminCourseComponents
- [ ] Server actions lezioni
- [ ] Prisma schema Lesson/Module/Course
- [ ] Route member area lezioni
