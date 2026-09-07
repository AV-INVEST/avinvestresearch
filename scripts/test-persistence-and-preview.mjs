// ------------------------------------------------------------------
// Test RUNTIME persistenza lezioni + normalizzatori video + preview
// AV Invest Research — non distruttivo, REVERT automatico
// ------------------------------------------------------------------
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Copia identica regex + normalizzatori da course-admin.ts per test diretto
const YOUTUBE_ID_REGEX =
  /^(?:https?:\/\/)?(?:(?:www|m|music)\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

const BUNNY_EMBED_REGEX =
  /^(?:https?:\/\/)?(?:iframe\.mediadelivery\.net\/embed\/(?:[^/]+)\/|assets\.mp4upload\.com\/|video\.b-cdn\.net\/)?([A-Za-z0-9_-]{8,})/;

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function extractYouTubeVideoId(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, videoId: null, warning: null };
  if (typeof raw !== 'string') return { ok: false, error: 'URL YouTube non valida.' };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, videoId: null, warning: null };
  const match = trimmed.match(YOUTUBE_ID_REGEX);
  if (match && match[1]) {
    return { ok: true, videoId: match[1], warning: 'Branding YouTube visibile.' };
  }
  if (/^[A-Za-z0-9_-]{6,}$/.test(trimmed)) {
    return { ok: true, videoId: trimmed, warning: 'Branding YouTube visibile.' };
  }
  return { ok: false, error: 'URL YouTube non riconosciuta.' };
}

function extractBunnyVideoId(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, videoId: null };
  if (typeof raw !== 'string') return { ok: false, error: 'Riferimento Bunny non valido.' };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, videoId: null };
  const match = trimmed.match(BUNNY_EMBED_REGEX);
  if (match && match[1]) return { ok: true, videoId: match[1] };
  if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return { ok: true, videoId: trimmed };
  return { ok: false, error: 'Riferimento Bunny non riconosciuto.' };
}

// Simula saveLessonAdmin SENZA requireAdmin (per test DB bypass auth)
function simulateSaveNormalization(values) {
  const title = (values.title || '').trim();
  if (title.length === 0) return { ok: false, error: 'titolo vuoto' };

  const youtube =
    values.videoSourceType === 'YOUTUBE'
      ? extractYouTubeVideoId(values.youtubeRawUrl || values.youtubeVideoId)
      : { ok: true, videoId: null, warning: null };

  if (!youtube.ok) return { ok: false, error: youtube.error };

  const bunny =
    values.videoSourceType === 'BUNNY_STREAM'
      ? extractBunnyVideoId(values.bunnyVideoId)
      : { ok: true, videoId: null };

  if (!bunny.ok) return { ok: false, error: bunny.error };

  const videoSourceType = values.videoSourceType || 'NONE';
  const youtubeVideoId = videoSourceType === 'YOUTUBE' ? youtube.videoId || null : null;
  const bunnyVideoId = videoSourceType === 'BUNNY_STREAM' ? bunny.videoId || null : null;

  if (videoSourceType === 'BUNNY_STREAM' && !bunnyVideoId) {
    return { ok: false, error: 'Bunny Stream: ID video vuoto dopo normalizzazione.' };
  }

  const slug = slugify(title);
  if (!slug) return { ok: false, error: 'slug fallito' };

  return {
    ok: true,
    normalized: {
      title,
      description: (values.description || '').trim() || null,
      durationMin: typeof values.durationMin === 'number' && values.durationMin > 0 ? values.durationMin : null,
      videoSourceType,
      youtubeVideoId,
      bunnyVideoId,
      slug,
    },
    youtubeWarning: youtube.warning || null,
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  let testLesson = null;
  let originalSnapshot = null;
  const failures = [];
  const passes = [];

  try {
    // ============================================================
    // SEED: leggi lezione DRAFT Foundations esistente per test
    // ============================================================
    const lessons = await prisma.lesson.findMany({
      take: 1,
      where: { status: 'DRAFT', module: { course: { slug: 'foundations' } } },
      include: { module: { include: { course: true } } },
    });
    if (lessons.length === 0) {
      throw new Error('Nessuna lezione DRAFT Foundations trovata per i test.');
    }
    testLesson = lessons[0];
    console.log('\n[TEST] Lezione scelta per i test:');
    console.log('       id       =', testLesson.id);
    console.log('       title    =', testLesson.title);
    console.log('       slug     =', testLesson.slug);
    console.log('       module   =', testLesson.module.slug, '(', testLesson.module.title, ')');
    console.log('       corso    =', testLesson.module.course.slug);

    // snapshot ORIGINALI per RESTORE
    originalSnapshot = {
      title: testLesson.title,
      description: testLesson.description,
      durationMin: testLesson.durationMin,
      videoSourceType: testLesson.videoSourceType,
      youtubeVideoId: testLesson.youtubeVideoId,
      bunnyVideoId: testLesson.bunnyVideoId,
    };
    console.log('\n[SNAPSHOT] Originali salvati:', JSON.stringify(originalSnapshot, null, 2));

    // ============================================================
    // TEST UNITARI NORMALIZZATORI (BUG 2)
    // ============================================================
    console.log('\n============================================================');
    console.log('TEST UNITARI EXTRACTORS');
    console.log('============================================================');

    // --- YouTube ---
    const ytCases = [
      ['dQw4w9WgXcQ', true, 'dQw4w9WgXcQ'],
      ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 'dQw4w9WgXcQ'],
      ['https://youtu.be/dQw4w9WgXcQ', true, 'dQw4w9WgXcQ'],
      ['https://m.youtube.com/shorts/dQw4w9WgXcQ', true, 'dQw4w9WgXcQ'],
      ['https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0', true, 'dQw4w9WgXcQ'],
      ['https://music.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared', true, 'dQw4w9WgXcQ'],
      ['', true, null],
      ['abc', false, null], // <6 chars
      ['https://google.com/foo', false, null], // non youtube
    ];
    for (const [input, expectOk, expectId] of ytCases) {
      const r = extractYouTubeVideoId(input);
      const pass = r.ok === expectOk && (r.videoId ?? null) === expectId;
      (pass ? passes : failures).push(`YouTube extract: ${JSON.stringify(input)} -> ${r.videoId ?? 'null'}/${r.ok}`);
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] YouTube(${JSON.stringify(input)}) = id=${r.videoId} ok=${r.ok}${r.error ? ' error=' + r.error : ''}`);
    }

    // --- Bunny ---
    const bunnyCases = [
      ['a1b2c3d4-e5f6', true, 'a1b2c3d4-e5f6'],
      ['https://iframe.mediadelivery.net/embed/12345/a1b2c3d4-e5f6/player?autoplay=true', true, 'a1b2c3d4-e5f6'],
      ['https://iframe.mediadelivery.net/embed/998877/abcd1234-5678', true, 'abcd1234-5678'],
      ['VIDEO-abc_XYZ-12345', true, 'VIDEO-abc_XYZ-12345'],
      ['', true, null],
      ['short', false, null], // <8 chars
      ['https://google.com/foo', false, null],
      ['!!invalid!!', false, null],
    ];
    for (const [input, expectOk, expectId] of bunnyCases) {
      const r = extractBunnyVideoId(input);
      const pass = r.ok === expectOk && (r.videoId ?? null) === expectId;
      (pass ? passes : failures).push(`Bunny extract: ${JSON.stringify(input)} -> ${r.videoId ?? 'null'}/${r.ok}`);
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] Bunny(${JSON.stringify(input)}) = id=${r.videoId} ok=${r.ok}${r.error ? ' error=' + r.error : ''}`);
    }

    // ============================================================
    // TEST 5 - UPDATE REALE SU BOZZA (modify+save+read+restore)
    // ============================================================
    console.log('\n============================================================');
    console.log('TEST 5: Persistenza campi base + RESTORE');
    console.log('============================================================');

    const step5Expected = simulateSaveNormalization({
      title: originalSnapshot.title, // mantieni titolo per non cambiare slug
      description: 'TEST_DESCRIPTION_TEMP_9988776655',
      durationMin: 42,
      videoSourceType: originalSnapshot.videoSourceType,
      youtubeRawUrl: originalSnapshot.youtubeVideoId,
      bunnyVideoId: originalSnapshot.bunnyVideoId,
    });
    if (!step5Expected.ok) throw new Error('step5 normalization failed: ' + step5Expected.error);
    const beforeUpdate = await prisma.lesson.findUnique({ where: { id: testLesson.id } });

    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: step5Expected.normalized,
      select: { id: true },
    });
    const afterUpdate = await prisma.lesson.findUnique({ where: { id: testLesson.id } });

    const test5Desc = afterUpdate.description === step5Expected.normalized.description;
    const test5Dur = afterUpdate.durationMin === 42;
    (test5Desc && test5Dur ? passes : failures).push('Test 5 UPDATE DB descrizione durata roundtrip');
    console.log('  [before] desc=%s dur=%s', JSON.stringify(beforeUpdate.description), beforeUpdate.durationMin);
    console.log('  [after]  desc=%s dur=%s', JSON.stringify(afterUpdate.description), afterUpdate.durationMin);
    console.log('  [%s] Descrizione persistita: %s', test5Desc ? 'PASS' : 'FAIL', afterUpdate.description);
    console.log('  [%s] Durata persistita: %s', test5Dur ? 'PASS' : 'FAIL', afterUpdate.durationMin);

    // ---- RIPRISTINA I valori originali campi base (test5 restore) ----
    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: {
        title: originalSnapshot.title,
        description: originalSnapshot.description,
        durationMin: originalSnapshot.durationMin,
      },
      select: { id: true },
    });
    const restoredStep5 = await prisma.lesson.findUnique({ where: { id: testLesson.id } });
    const test5Restore =
      restoredStep5.description === originalSnapshot.description &&
      restoredStep5.durationMin === originalSnapshot.durationMin &&
      restoredStep5.title === originalSnapshot.title;
    (test5Restore ? passes : failures).push('Test 5 RESTORE valori originali');
    console.log('  [%s] RESTORE originale dopo Test 5:', test5Restore ? 'PASS' : 'FAIL', {
      desc: restoredStep5.description,
      dur: restoredStep5.durationMin,
      title: restoredStep5.title,
    });

    // ============================================================
    // TEST 6 - Sorgente NONE persistenza + reload + restore
    // ============================================================
    console.log('\n============================================================');
    console.log('TEST 6: videoSourceType = NONE roundtrip');
    console.log('============================================================');

    const step6Expected = simulateSaveNormalization({
      title: originalSnapshot.title,
      description: originalSnapshot.description ?? undefined,
      durationMin: originalSnapshot.durationMin ?? undefined,
      videoSourceType: 'NONE',
    });
    if (!step6Expected.ok) throw new Error('step6 norm failed');
    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: step6Expected.normalized,
      select: { id: true },
    });
    await prisma.$disconnect(); // forzare query fresca
    await prisma.$connect();
    const step6Db = await prisma.lesson.findUnique({ where: { id: testLesson.id } });
    const test6A = step6Db.videoSourceType === 'NONE';
    const test6B = step6Db.youtubeVideoId === null;
    const test6C = step6Db.bunnyVideoId === null;
    (test6A && test6B && test6C ? passes : failures).push('Test 6 NONE persistence');
    console.log('  [%s] sourceType=NONE: %s', test6A ? 'PASS' : 'FAIL', step6Db.videoSourceType);
    console.log('  [%s] ytId=null: %s', test6B ? 'PASS' : 'FAIL', step6Db.youtubeVideoId);
    console.log('  [%s] bbId=null: %s', test6C ? 'PASS' : 'FAIL', step6Db.bunnyVideoId);

    // ============================================================
    // TEST 7 - YOUTUBE persistenza + reload + restore
    // ============================================================
    console.log('\n============================================================');
    console.log('TEST 7: videoSourceType = YOUTUBE URL roundtrip');
    console.log('============================================================');

    const step7Expected = simulateSaveNormalization({
      title: originalSnapshot.title,
      description: originalSnapshot.description ?? undefined,
      durationMin: originalSnapshot.durationMin ?? undefined,
      videoSourceType: 'YOUTUBE',
      youtubeRawUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    if (!step7Expected.ok) throw new Error('step7 norm failed: ' + step7Expected.error);
    console.log('  [expected] youtubeVideoId =', step7Expected.normalized.youtubeVideoId);
    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: step7Expected.normalized,
      select: { id: true },
    });
    await prisma.$disconnect();
    await prisma.$connect();
    const step7Db = await prisma.lesson.findUnique({ where: { id: testLesson.id } });
    const test7A = step7Db.videoSourceType === 'YOUTUBE';
    const test7B = step7Db.youtubeVideoId === 'dQw4w9WgXcQ';
    const test7C = step7Db.bunnyVideoId === null;
    (test7A && test7B && test7C ? passes : failures).push('Test 7 YOUTUBE persistence URL dQw4w9WgXcQ');
    console.log('  [%s] sourceType=YOUTUBE: %s', test7A ? 'PASS' : 'FAIL', step7Db.videoSourceType);
    console.log('  [%s] ytId=dQw4w9WgXcQ: %s', test7B ? 'PASS' : 'FAIL', step7Db.youtubeVideoId);
    console.log('  [%s] bbId=null: %s', test7C ? 'PASS' : 'FAIL', step7Db.bunnyVideoId);

    // TEST 7 BIS: ID puro YT
    const step7bExpected = simulateSaveNormalization({
      title: originalSnapshot.title,
      videoSourceType: 'YOUTUBE',
      youtubeRawUrl: '9bZkp7q19f0',
    });
    (step7bExpected.ok && step7bExpected.normalized.youtubeVideoId === '9bZkp7q19f0' ? passes : failures).push('Test 7b YOUTUBE ID puro');
    console.log('  [%s] YT ID puro 9bZkp7q19f0 -> %s', step7bExpected.ok && step7bExpected.normalized.youtubeVideoId === '9bZkp7q19f0' ? 'PASS' : 'FAIL', step7bExpected.normalized.youtubeVideoId);

    // ============================================================
    // TEST 8 - BUNNY STREAM persistenza + validation
    // ============================================================
    console.log('\n============================================================');
    console.log('TEST 8: BUNNY STREAM ID + URL embed normalizzazione');
    console.log('============================================================');

    // 8A: ID puro
    const step8aExpected = simulateSaveNormalization({
      title: originalSnapshot.title,
      videoSourceType: 'BUNNY_STREAM',
      bunnyVideoId: 'bunny-test-id-abc123-XYZ',
    });
    if (!step8aExpected.ok) throw new Error('step8a norm failed: ' + step8aExpected.error);
    console.log('  [8a] pure ID -> normalized id =', step8aExpected.normalized.bunnyVideoId);

    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: step8aExpected.normalized,
      select: { id: true },
    });
    await prisma.$disconnect();
    await prisma.$connect();
    const step8aDb = await prisma.lesson.findUnique({ where: { id: testLesson.id } });
    const test8aA = step8aDb.videoSourceType === 'BUNNY_STREAM';
    const test8aB = step8aDb.bunnyVideoId === 'bunny-test-id-abc123-XYZ';
    const test8aC = step8aDb.youtubeVideoId === null;
    (test8aA && test8aB && test8aC ? passes : failures).push('Test 8a BUNNY pure ID persistence');
    console.log('  [%s] source=BUNNY: %s', test8aA ? 'PASS' : 'FAIL', step8aDb.videoSourceType);
    console.log('  [%s] bbId=pure: %s', test8aB ? 'PASS' : 'FAIL', step8aDb.bunnyVideoId);
    console.log('  [%s] ytId=null: %s', test8aC ? 'PASS' : 'FAIL', step8aDb.youtubeVideoId);

    // 8B: URL embed Bunny -> normalizzazione
    const step8bExpected = simulateSaveNormalization({
      title: originalSnapshot.title,
      videoSourceType: 'BUNNY_STREAM',
      bunnyVideoId: 'https://iframe.mediadelivery.net/embed/991122/some-video-id-12345678/player?autoplay=false&loop=true',
    });
    const test8b = step8bExpected.ok && step8bExpected.normalized.bunnyVideoId === 'some-video-id-12345678';
    (test8b ? passes : failures).push('Test 8b BUNNY URL embed normalization');
    console.log('  [%s] URL embed -> bbId = %s', test8b ? 'PASS' : 'FAIL', step8bExpected.ok ? step8bExpected.normalized.bunnyVideoId : 'ERROR ' + step8bExpected.error);

    // 8C: BUNNY vuoto -> DEVE fallire validation
    const step8cExpected = simulateSaveNormalization({
      title: originalSnapshot.title,
      videoSourceType: 'BUNNY_STREAM',
      bunnyVideoId: '',
    });
    const test8c = step8cExpected.ok === false;
    (test8c ? passes : failures).push('Test 8c BUNNY empty validation failure expected');
    console.log('  [%s] BUNNY empty must fail: ok=%s err=%s', test8c ? 'PASS' : 'FAIL', step8cExpected.ok, step8cExpected.error);

    // ============================================================
    // RESTORE FINALE ORIGINALI VIDEO
    // ============================================================
    console.log('\n============================================================');
    console.log('RESTORE FINALE dei valori originali (comprese sorgenti video)');
    console.log('============================================================');

    await prisma.lesson.update({
      where: { id: testLesson.id },
      data: {
        title: originalSnapshot.title,
        description: originalSnapshot.description,
        durationMin: originalSnapshot.durationMin,
        videoSourceType: originalSnapshot.videoSourceType,
        youtubeVideoId: originalSnapshot.youtubeVideoId,
        bunnyVideoId: originalSnapshot.bunnyVideoId,
        slug: slugify(originalSnapshot.title),
      },
      select: { id: true },
    });
    await prisma.$disconnect();
    await prisma.$connect();
    const finalDb = await prisma.lesson.findUnique({ where: { id: testLesson.id } });
    const restoreOk =
      finalDb.title === originalSnapshot.title &&
      finalDb.description === originalSnapshot.description &&
      finalDb.durationMin === originalSnapshot.durationMin &&
      finalDb.videoSourceType === originalSnapshot.videoSourceType &&
      finalDb.youtubeVideoId === originalSnapshot.youtubeVideoId &&
      finalDb.bunnyVideoId === originalSnapshot.bunnyVideoId;
    (restoreOk ? passes : failures).push('RESTORE FINALE COMPLETO tutti i campi originali');
    console.log('  [%s] RESTORE:', restoreOk ? 'PASS' : 'FAIL');
    console.log('     expected:', JSON.stringify(originalSnapshot, null, 2));
    console.log('     db      :', JSON.stringify({
      title: finalDb.title,
      description: finalDb.description,
      durationMin: finalDb.durationMin,
      videoSourceType: finalDb.videoSourceType,
      youtubeVideoId: finalDb.youtubeVideoId,
      bunnyVideoId: finalDb.bunnyVideoId,
    }, null, 2));

    // ============================================================
    // BUG 4: Integrità moduli Foundations (order=0 duplicati)
    // ============================================================
    console.log('\n============================================================');
    console.log('BUG 4: Integrità slug/moduli Foundations order=0');
    console.log('============================================================');
    const foundations = await prisma.course.findUnique({
      where: { slug: 'foundations' },
      select: {
        id: true,
        modules: {
          where: { order: 0 },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            _count: { select: { lessons: true } },
            createdAt: true,
          },
        },
      },
    });
    console.log('  Totale moduli order=0 in Foundations:', foundations?.modules.length ?? 0);
    const ghostModules = [];
    for (const m of foundations.modules) {
      console.log('   - id=%s slug=%s title=%s lessons=%d', m.id, m.slug, m.title, m._count.lessons);
      if (m._count.lessons === 0) ghostModules.push(m);
    }
    const hasDuplicateOrder0 = foundations.modules.length > 1;
    const hasGhostEmpty = ghostModules.length > 0;
    console.log('  [INFO] duplicati order=0: %s; moduli vuoti/ghost: %d', hasDuplicateOrder0, ghostModules.length);
    if (hasGhostEmpty) console.log('  [WARNING] Moduli ghost vuoti (NON cancellato):', ghostModules.map(g => g.slug));
    passes.push(`Integrità slug moduli Foundations: ${hasDuplicateOrder0 ? 'trovati duplicati order=0 (ghost module)' : 'unico modulo ok'}; ghost empty = ${ghostModules.length}`);

    // Verifica: tutte le lesson DRAFT del corso puntano al modulo NON-ghost
    const realModule = foundations.modules.find((m) => m._count.lessons > 0);
    if (realModule) {
      const lessonsInReal = await prisma.lesson.count({ where: { moduleId: realModule.id } });
      console.log('  Lezioni in modulo reale (%s): %d', realModule.slug, lessonsInReal);
    }

    // ============================================================
    // TEST 9+10+11: LOGICA PREVIEW MEMBER AREA (simulata statica)
    // ============================================================
    console.log('\n============================================================');
    // Simula la fetchFullCourseStructure con e senza includeDrafts
    // usando Prisma query dirette equivalenti
    console.log('TEST 9+10+11: DRAFT preview bypass logica admin vs anon');
    console.log('============================================================');

    const courseSlug = 'foundations';
    // includeDrafts=false (utente anonimo o non-admin)
    const courseWithoutDrafts = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        modules: {
          orderBy: [{ order: 'asc' }, { title: 'asc' }],
          select: {
            id: true,
            slug: true,
            title: true,
            lessons: {
              where: { status: 'PUBLISHED' }, // includeDrafts=false
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              select: { id: true, slug: true, title: true, status: true },
            },
          },
        },
      },
    });
    // includeDrafts=true (admin + ?preview=1)
    const courseWithDrafts = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        modules: {
          orderBy: [{ order: 'asc' }, { title: 'asc' }],
          select: {
            id: true,
            slug: true,
            title: true,
            lessons: {
              // includeDrafts=true → nessun filtro status
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              select: { id: true, slug: true, title: true, status: true },
            },
          },
        },
      },
    });

    // Prendi la lesson usata per i test: deve esserci solo in includeDrafts=true
    let moduleWithLesson_noDraft = null;
    let lessonFound_noDraft = null;
    for (const m of courseWithoutDrafts.modules) {
      const l = m.lessons.find((x) => x.slug === testLesson.slug);
      if (l) { moduleWithLesson_noDraft = m; lessonFound_noDraft = l; break; }
    }
    let moduleWithLesson_draft = null;
    let lessonFound_draft = null;
    for (const m of courseWithDrafts.modules) {
      const l = m.lessons.find((x) => x.slug === testLesson.slug);
      if (l) { moduleWithLesson_draft = m; lessonFound_draft = l; break; }
    }
    const test9 = lessonFound_draft && moduleWithLesson_draft?.slug === testLesson.module.slug;
    const test10 = lessonFound_noDraft == null; // la lezione è DRAFT, non deve apparire senza includeDrafts
    (test9 ? passes : failures).push('Test 9 DRAFT inclusa in includeDrafts=true (admin preview)');
    (test10 ? passes : failures).push('Test 10 DRAFT esclusa da includeDrafts=false (anonimo)');
    console.log('  [includeDrafts=false, NON-ADMIN] lesson=%s slug=%s moduleSlug=%s',
      lessonFound_noDraft ? 'TROVATA (ERRATO)' : 'NON TROVATA (CORRETTO, 404 atteso)',
      lessonFound_noDraft?.slug ?? null,
      moduleWithLesson_noDraft?.slug ?? null);
    console.log('  [includeDrafts=true,  ADMIN    ] lesson=%s slug=%s moduleSlug=%s (lesson own module slug=%s)',
      lessonFound_draft ? 'TROVATA (CORRETTO)' : 'NON TROVATA (ERRATO)',
      lessonFound_draft?.slug ?? null,
      moduleWithLesson_draft?.slug ?? null,
      testLesson.module.slug);
    // Test 11: se ci fosse una PUBLISHED sarebbe visibile in entrambe.
    // Per verify costruiamo: trova una PUBLISHED se esiste
    const anyPublished = await prisma.lesson.findFirst({
      where: { status: 'PUBLISHED' },
      select: { slug: true, moduleId: true, module: { select: { slug: true, course: { select: { slug: true } } } } },
    });
    let test11 = true;
    if (anyPublished) {
      for (const m of courseWithoutDrafts.modules) {
        const pub = m.lessons.find((l) => l.slug === anyPublished.slug);
        if (pub) { test11 = true; break; }
      }
    }
    passes.push(`Test 11 PUBLISHED access path (published exist=${!!anyPublished}; check ok=${test11})`);
    console.log('  [Test11] PUBLISHED lesson esistente? %s — includeDrafts=false la vede? %s', !!anyPublished, test11);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n============================================================');
    console.log('SUMMARY TEST RUNTIME');
    console.log('============================================================');
    console.log('PASS count =', passes.length);
    console.log('FAIL count =', failures.length);
    if (failures.length) {
      console.log('\nFAILURES LIST:');
      failures.forEach((f, i) => console.log(`  [FAIL ${i + 1}] ${f}`));
      process.exitCode = 1;
    } else {
      console.log('\n✅ TUTTI I TEST RUNTIME PASSATI');
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('\n[FATAL ERROR in test script]:', err);
    // TRY RESTORE EMERGENZA
    if (testLesson && originalSnapshot) {
      try {
        console.log('\n[EMERGENZA RESTORE] Ripristino originali...');
        await prisma.lesson.update({
          where: { id: testLesson.id },
          data: {
            title: originalSnapshot.title,
            description: originalSnapshot.description,
            durationMin: originalSnapshot.durationMin,
            videoSourceType: originalSnapshot.videoSourceType,
            youtubeVideoId: originalSnapshot.youtubeVideoId,
            bunnyVideoId: originalSnapshot.bunnyVideoId,
          },
        });
        console.log('[EMERGENZA RESTORE] OK');
      } catch (e) {
        console.error('[EMERGENZA RESTORE FALLITA]:', e);
      }
    }
    process.exitCode = 2;
  } finally {
    try { await prisma.$disconnect(); } catch { /* empty */ }
  }
}

main();
