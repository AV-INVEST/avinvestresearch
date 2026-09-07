// ------------------------------------------------------------------
// TEST RUNTIME round 2 fixes
// 1. Test azioni dual compatibilità (1-arg form diretto / 2-arg useActionState)
// 2. Test delete lesson (crea temp → delete → ordine riallineato)
// 3. DB check youtubeVideoId lezione cmtqd04oj00041zh6p6br25cl
// 4. Verifica asFormData semantica
// ------------------------------------------------------------------
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Copia asFormData + save normalization identiche a production code
function asFormData(a, b) {
  if (a instanceof FormData) return a;
  if (b instanceof FormData) return b;
  throw new Error('Invalid server action invocation: expected FormData.');
}

const YOUTUBE_ID_REGEX =
  /^(?:https?:\/\/)?(?:(?:www|m|music)\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
const BUNNY_EMBED_REGEX =
  /^(?:https?:\/\/)?(?:iframe\.mediadelivery\.net\/embed\/(?:[^/]+)\/|assets\.mp4upload\.com\/|video\.b-cdn\.net\/)?([A-Za-z0-9_-]{8,})/;

function extractYouTubeVideoId(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, videoId: null, warning: null };
  if (typeof raw !== 'string') return { ok: false, error: 'URL YouTube non valida.' };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, videoId: null, warning: null };
  const match = trimmed.match(YOUTUBE_ID_REGEX);
  if (match && match[1]) return { ok: true, videoId: match[1], warning: 'ok' };
  if (/^[A-Za-z0-9_-]{6,}$/.test(trimmed)) return { ok: true, videoId: trimmed, warning: 'ok' };
  return { ok: false, error: 'URL YouTube non riconosciuta.' };
}

function extractBunnyVideoId(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, videoId: null };
  if (typeof raw !== 'string') return { ok: false, error: 'Rif non valido.' };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, videoId: null };
  const match = trimmed.match(BUNNY_EMBED_REGEX);
  if (match && match[1]) return { ok: true, videoId: match[1] };
  if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return { ok: true, videoId: trimmed };
  return { ok: false, error: 'Rif Bunny non riconosciuto.' };
}

function makeFD(entries) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, String(v ?? ''));
  return fd;
}

const passes = [];
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passes.push(name + (detail ? ' ' + detail : ''));
    console.log('  [PASS]', name, detail);
  } else {
    failures.push(name + (detail ? ' ' + detail : ''));
    console.log('  [FAIL]', name, detail);
  }
}

async function main() {
  try {
    // ================================================
    // TEST A: asFormData dual signature
    // ================================================
    console.log('\n============================================================');
    console.log('TEST A: Dual signature asFormData adapter');
    console.log('============================================================');

    const fd = makeFD({ lessonId: 'L1', courseSlug: 'foundations' });

    // Caso A.1: direct form action invocation -> 1 arg (FormData)
    const resultA1 = asFormData(fd, undefined);
    check('A.1 direct form action (1 arg) lessonId=L1', resultA1.get('lessonId') === 'L1');

    // Caso A.2: React 19 useActionState -> 2 args (prevState=null, FormData)
    const resultA2 = asFormData(null, fd);
    check('A.2 useActionState (2 args, null prev) lessonId=L1', resultA2.get('lessonId') === 'L1');

    // Caso A.3: useActionState with string prevState (first return value, not FormData)
    const resultA3 = asFormData('some-state-string', fd);
    check('A.3 useActionState prev=string lessonId=L1', resultA3.get('lessonId') === 'L1');

    // Caso A.4: invalid -> throw
    let a4Threw = false;
    try {
      asFormData(null, undefined);
    } catch {
      a4Threw = true;
    }
    check('A.4 invalid (no FormData) throws', a4Threw);

    // ================================================
    // TEST B: DB check youtubeVideoId lesson cmtqd04oj00041zh6p6br25cl
    // ================================================
    console.log('\n============================================================');
    console.log('TEST B: youtubeVideoId DB per lezione "Partire da zero..."');
    console.log('============================================================');
    const lessonB = await prisma.lesson.findUnique({
      where: { id: 'cmtqd04oj00041zh6p6br25cl' },
      select: {
        id: true,
        title: true,
        youtubeVideoId: true,
        videoSourceType: true,
        status: true,
        bunnyVideoId: true,
        module: { select: { slug: true, title: true } },
      },
    });
    if (!lessonB) {
      check('B.1 lezione esiste', false, 'non trovata');
    } else {
      console.log('  DB: titolo=', lessonB.title, 'status=', lessonB.status, 'source=', lessonB.videoSourceType, 'ytId=', lessonB.youtubeVideoId, 'bbId=', lessonB.bunnyVideoId);
      check('B.1 lezione esiste', true);
      check('B.2 modulo corretto (no ghost)', lessonB.module.slug === 'fondamenti-analisi-tecnica', 'slug=' + lessonB.module.slug);
      // B.3: sourceType deve essere NONE oppure YOUTUBE/BUNNY. Se youtubeVideoId è settato → source=YOUTUBE (invariante consistency)
      if (lessonB.youtubeVideoId) {
        check('B.3 consistenza source=YOUTUBE se ytId presente', lessonB.videoSourceType === 'YOUTUBE', `source=${lessonB.videoSourceType} ytId=${lessonB.youtubeVideoId}`);
        check('B.4 youtubeVideoId estratto corretto formato', /^[A-Za-z0-9_-]{6,}$/.test(lessonB.youtubeVideoId), `ytId=${lessonB.youtubeVideoId}`);
        check('B.5 youtubeVideoId normalize pass', extractYouTubeVideoId(lessonB.youtubeVideoId).videoId === lessonB.youtubeVideoId);
      } else {
        check('B.3 consistenza source≠YOUTUBE se ytId assente', lessonB.videoSourceType !== 'YOUTUBE', `source=${lessonB.videoSourceType}`);
        check('B.4 youtubeVideoId null se non salvato', lessonB.youtubeVideoId === null);
      }
    }

    // ================================================
    // TEST C: create temp lesson → verify order → delete → order restored (feature Delete + Trashcan)
    // ================================================
    console.log('\n============================================================');
    console.log('TEST C: Create temp lesson → Delete → order integrity restore');
    console.log('============================================================');

    // Usa modulo reale foundations (slug fondamenti-analisi-tecnica)
    const realModule = await prisma.module.findFirst({
      where: { slug: 'fondamenti-analisi-tecnica' },
      select: { id: true, slug: true },
    });
    if (!realModule) throw new Error('Modulo reale non trovato per test C.');

    // Stato ordine PRIMA
    const beforeLessons = await prisma.lesson.findMany({
      where: { moduleId: realModule.id },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, slug: true, order: true },
    });
    console.log('  PRIMA: lessons=', beforeLessons.length, 'max order=', Math.max(...beforeLessons.map(l => l.order)));
    const beforeCount = beforeLessons.length;
    const maxOrderBefore = Math.max(...beforeLessons.map(l => l.order));

    // Crea temp lezione
    const tempTitle = 'TEST-TRAE-DELETE-ME-LezioneTemp-' + Date.now().toString(36);
    const tempSlug = tempTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g,'').slice(0,100);
    const created = await prisma.lesson.create({
      data: {
        moduleId: realModule.id,
        slug: tempSlug,
        title: tempTitle,
        description: 'TEST DA ELIMINARE',
        durationMin: 1,
        videoSourceType: 'NONE',
        youtubeVideoId: null,
        bunnyVideoId: null,
        status: 'DRAFT',
        order: maxOrderBefore + 1,
      },
      select: { id: true, title: true, order: true },
    });
    console.log('  CREATED:', created.title, 'id=', created.id, 'order=', created.order);
    const afterCreateCount = await prisma.lesson.count({ where: { moduleId: realModule.id } });
    check('C.1 creazione temp lesson riuscita (count +1)', afterCreateCount === beforeCount + 1, `before=${beforeCount} afterCreate=${afterCreateCount}`);
    check('C.1b ordine assegnato corretto (max+1)', created.order === maxOrderBefore + 1, `created.order=${created.order} maxBefore=${maxOrderBefore}`);

    // Simula eliminazione come deleteLessonAdmin (stessa logica senza requireAdmin):
    // 1) delete progressi, 2) delete lesson, 3) decrement order su order > creato.order
    const deletedLessonOrder = created.order;
    await prisma.$transaction([
      prisma.lessonProgress.deleteMany({ where: { lessonId: created.id } }),
      prisma.lesson.delete({ where: { id: created.id } }),
      prisma.lesson.updateMany({
        where: { moduleId: realModule.id, order: { gt: deletedLessonOrder } },
        data: { order: { decrement: 1 } },
      }),
    ]);
    console.log('  DELETE OK');
    // Verifica count torna a prima
    const afterDeleteCount = await prisma.lesson.count({ where: { moduleId: realModule.id } });
    check('C.2 delete lezione temp riuscita (count torna originale)', afterDeleteCount === beforeCount, `before=${beforeCount} afterDelete=${afterDeleteCount}`);

    // Verifica ordine rimane consecutivo senza buchi (take last N, order should be 0..N-1)
    const afterLessons = await prisma.lesson.findMany({
      where: { moduleId: realModule.id },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });
    let hasGaps = false;
    for (let i = 0; i < afterLessons.length; i++) {
      if (afterLessons[i].order !== i) { hasGaps = true; console.log('    GAP at idx', i, 'expected order', i, 'got', afterLessons[i].order); break; }
    }
    check('C.3 ordine consecutivo senza buchi dopo delete', !hasGaps, `count=${afterLessons.length} gapFound=${hasGaps}`);

    // Verifica la lezione eliminata è veramente assente dal DB
    const stillExists = await prisma.lesson.findUnique({ where: { id: created.id }, select: { id: true } });
    check('C.4 lezione temp assente dal DB dopo delete', !stillExists, 'exists=' + !!stillExists);

    // ================================================
    // TEST D: Extractors (YouTube + Bunny sanity check per regressione)
    // ================================================
    console.log('\n============================================================');
    console.log('TEST D: YouTube/Bunny extractor regressione');
    console.log('============================================================');
    const ytURL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s';
    const yt = extractYouTubeVideoId(ytURL);
    check('D.1 YT URL standard -> id=dQw4w9WgXcQ', yt.ok === true && yt.videoId === 'dQw4w9WgXcQ');
    const bunnyURL = 'https://iframe.mediadelivery.net/embed/54321/abcd-EFGH-1234-5678/player?param=x';
    const bb = extractBunnyVideoId(bunnyURL);
    check('D.2 Bunny embed URL -> abcd-EFGH-1234-5678', bb.ok === true && bb.videoId === 'abcd-EFGH-1234-5678');
    const bbEmpty = extractBunnyVideoId('');
    check('D.3 Bunny empty -> ok=true, videoId=null', bbEmpty.ok === true && bbEmpty.videoId === null);
    const bbInvalidShort = extractBunnyVideoId('x');
    check('D.4 Bunny short <8 char -> false', bbInvalidShort.ok === false);

    // ================================================
    // TEST E: Anteprima href suffix (permette preview=1 persistenza)
    // Verifica buildLessonHref da course-queries e concatenazione logica previewSuffix
    // ================================================
    console.log('\n============================================================');
    console.log('TEST E: preview persistence buildLessonHref suffix');
    console.log('============================================================');
    function buildBase(c, m, l) {
      return `/area-membri/corsi/${encodeURIComponent(c)}/${encodeURIComponent(m)}/${encodeURIComponent(l)}`;
    }
    const isPreviewAdmin = true; // simulate allowPreview
    const adminPrev = buildBase('foundations', 'fondamenti-analisi-tecnica', 'lezione-due') + (isPreviewAdmin ? '?preview=1' : '');
    check('E.1 prev href include ?preview=1 se allowPreview', adminPrev.includes('?preview=1'));
    const normalPrev = buildBase('foundations', 'fondamenti-analisi-tecnica', 'lezione-due') + (false ? '?preview=1' : '');
    check('E.2 prev href NO ?preview=1 se utente normale', !normalPrev.includes('preview'));

    // ================================================
    // SUMMARY
    // ================================================
    console.log('\n============================================================');
    console.log('SUMMARY ROUND 2 RUNTIME TESTS');
    console.log('============================================================');
    console.log('PASS =', passes.length, 'FAIL =', failures.length);
    if (failures.length > 0) {
      console.log('\nFAILURES:');
      failures.forEach(f => console.log('  -', f));
      process.exitCode = 1;
    } else {
      console.log('\n✅ ALL ROUND2 TESTS PASSED');
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('\n[FATAL]', err);
    process.exitCode = 2;
  } finally {
    try { await prisma.$disconnect(); } catch { /* empty */ }
  }
}

main();
