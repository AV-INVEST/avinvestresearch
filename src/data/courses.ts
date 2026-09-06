export interface Lesson {
  slug: string;
  title: string;
  description?: string;
  durationMin?: number;
  youtubeId?: string;
  completed?: boolean;
}

export interface Module {
  slug: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  modules: Module[];
}

export const COURSES: Course[] = [
  {
    slug: 'foundations',
    title: 'AV Foundations',
    subtitle: 'Analisi tecnica da zero',
    description:
      'Un percorso chiaro e progressivo per comprendere grafici, trend, livelli, volumi, indicatori e gestione del rischio.',
    modules: [],
  },
  {
    slug: 'trading-lab',
    title: 'AV Trading Lab',
    subtitle: 'Metodo operativo avanzato',
    description:
      'Un percorso avanzato dedicato a strategia, contesto, conferme, invalidazione, dimensionamento e disciplina operativa.',
    modules: [],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function resolveLesson(
  course: Course,
  moduleSlug: string,
  lessonSlug: string,
): { module: Module; lesson: Lesson } | null {
  for (const m of course.modules) {
    if (m.slug !== moduleSlug) continue;
    for (const l of m.lessons) {
      if (l.slug === lessonSlug) return { module: m, lesson: l };
    }
  }
  return null;
}
