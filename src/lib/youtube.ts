import type { MediaSummaryPreview } from '@/types/media';

export function getYouTubeInfo(url: string): Partial<MediaSummaryPreview> {
  const re: Partial<MediaSummaryPreview> = {};
  re.idVideoSource = 'www.youtube.com';
  re.haveVideo = true;
  re.id = url;
  re.title = 'YouTube Video';
  re.url = url;
  re.videoParts = { urlVideo: url };
  re.permalink = url;
  return re;
}
