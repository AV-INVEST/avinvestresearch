/**
 * Regole commerciali del bundle "AV Complete Academy".
 *
 * Modulo PURO: nessun accesso a rete o database, così da poter essere
 * riutilizzato sia lato server (checkout, entitlements) sia in fase di test.
 *
 * Il bundle è una singola transazione che sblocca entrambi i videocorsi
 * (foundations + trading-lab) senza generare acquisti fittizi.
 */

export const COURSE_BUNDLE_SLUG = 'complete-academy';

export const BUNDLE_INCLUDED_COURSES = ['foundations', 'trading-lab'] as const;

export type BundleIncludedCourse = (typeof BUNDLE_INCLUDED_COURSES)[number];

/**
 * Espande l'insieme dei prodotti posseduti: il bundle sblocca anche i
 * corsi inclusi. Non introduce nuovi acquisti, opera solo in memoria.
 */
export function expandOwnedSlugs(owned: Iterable<string>): Set<string> {
  const expanded = new Set<string>();
  for (const slug of owned) {
    expanded.add(slug);
    if (slug === COURSE_BUNDLE_SLUG) {
      for (const course of BUNDLE_INCLUDED_COURSES) expanded.add(course);
    }
  }
  return expanded;
}

export function bundleIncludesCourse(productSlug: string, courseSlug: string): boolean {
  return (
    productSlug === COURSE_BUNDLE_SLUG &&
    (BUNDLE_INCLUDED_COURSES as readonly string[]).includes(courseSlug)
  );
}

/**
 * Regola commerciale di acquisto.
 *
 * `owned` deve essere già espanso (vedi `expandOwnedSlugs`).
 * - il bundle non è acquistabile da chi possiede già almeno uno dei corsi inclusi;
 * - un corso già posseduto (anche tramite bundle) non è riacquistabile.
 */
export function isPurchasableGivenOwnership(productSlug: string, owned: Set<string>): boolean {
  if (productSlug === COURSE_BUNDLE_SLUG) {
    if (owned.has(COURSE_BUNDLE_SLUG)) return false;
    return BUNDLE_INCLUDED_COURSES.every((course) => !owned.has(course));
  }
  return !owned.has(productSlug);
}
