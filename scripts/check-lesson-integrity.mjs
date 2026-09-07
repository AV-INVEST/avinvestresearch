import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== BUG 4: Foundations Module & Lesson Integrity Check ===\n');

  const foundations = await prisma.course.findUnique({
    where: { slug: 'foundations' },
    include: {
      modules: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          lessons: {
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              order: true,
              videoSourceType: true,
              youtubeVideoId: true,
              bunnyVideoId: true,
            },
          },
        },
      },
    },
  });

  if (!foundations) {
    console.log('ERROR: foundations course not found!');
    return;
  }

  console.log(`Course: ${foundations.title} (id=${foundations.id})`);
  console.log(`\n--- Found ${foundations.modules.length} modules ---`);

  for (const m of foundations.modules) {
    console.log(`\nModule: order=${m.order}  id=${m.id.slice(0, 8)}  slug="${m.slug}"`);
    console.log(`        title="${m.title}"`);
    console.log(`        Lessons (${m.lessons.length}):`);
    for (const l of m.lessons) {
      console.log(
        `  [${l.order}] ${l.status} id=${l.id.slice(0, 8)} slug="${l.slug}"`,
      );
      console.log(
        `       title="${l.title.slice(0, 60)}"  video=${l.videoSourceType} yt=${l.youtubeVideoId ?? '-'} bb=${l.bunnyVideoId ?? '-'}`,
      );
    }
  }

  console.log('\n--- Duplicate order=0 modules ---');
  const dupOrder = foundations.modules.filter((m) => m.order === 0);
  if (dupOrder.length > 1) {
    console.log(`WARNING: Found ${dupOrder.length} modules with order=0:`);
    for (const m of dupOrder) {
      console.log(`  - slug="${m.slug}" title="${m.title}" id=${m.id}`);
    }
  } else {
    console.log('OK: Single module with order=0');
  }

  console.log('\n--- Duplicate lesson slugs across ALL modules in foundations ---');
  const allLessons = foundations.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleSlug: m.slug })),
  );
  const bySlug = new Map();
  for (const l of allLessons) {
    if (bySlug.has(l.slug)) {
      bySlug.get(l.slug).push(l);
    } else {
      bySlug.set(l.slug, [l]);
    }
  }
  let dupSlugFound = false;
  for (const [slug, lessons] of bySlug) {
    if (lessons.length > 1) {
      dupSlugFound = true;
      console.log(`DUP slug="${slug}":`);
      for (const l of lessons) {
        console.log(`  - in module ${l.moduleSlug}: id=${l.id.slice(0, 8)} title="${l.title.slice(0, 50)}"`);
      }
    }
  }
  if (!dupSlugFound) console.log('OK: No duplicate lesson slugs');

  console.log('\n--- DRAFT Lessons with all required fields for preview ---');
  const drafts = allLessons.filter((l) => l.status === 'DRAFT');
  if (drafts.length === 0) {
    console.log('No DRAFT lessons found.');
  } else {
    for (const l of drafts) {
      const href = `/area-membri/corsi/foundations/${l.moduleSlug}/${l.slug}?preview=1`;
      console.log(`  DRAFT: "${l.title}"`);
      console.log(`         preview href: ${href}`);
      console.log(`         id: ${l.id} (for admin editor: /admin/corsi/foundations/lezioni/${l.id})`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total modules: ${foundations.modules.length}`);
  console.log(`Total lessons: ${allLessons.length}`);
  console.log(`Published: ${allLessons.filter((l) => l.status === 'PUBLISHED').length}`);
  console.log(`Drafts: ${drafts.length}`);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
