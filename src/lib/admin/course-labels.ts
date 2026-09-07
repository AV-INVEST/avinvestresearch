import type { VideoSourceType } from '@prisma/client';

const SOURCE_NONE = 'NESSUNO';
const SOURCE_YT = 'YouTube (testing)';
const SOURCE_BUNNY = 'Bunny Stream';

export function lessonSourceLabel(
  source: VideoSourceType | null | undefined,
): { label: string; cls: string } {
  if (!source || source === 'NONE') {
    return {
      label: SOURCE_NONE,
      cls: 'border-av-line text-av-muted bg-av-bg-2/60',
    };
  }
  if (source === 'YOUTUBE') {
    return {
      label: SOURCE_YT,
      cls: 'border-av-yellow-deep/30 bg-av-yellow/10 text-av-yellow',
    };
  }
  return {
    label: SOURCE_BUNNY,
    cls: 'border-av-green-deep/40 bg-av-green/10 text-av-green',
  };
}
