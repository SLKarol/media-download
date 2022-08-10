import type { Reddit } from '@/lib/reddit';
import type { MediaSummaryPreview } from '@/types/media';
import { getVideoSource } from '@/lib/videoCommon';
import { downloadYapPageInfo } from '@/lib/yaplakal';
import { downloadRedGifsInfo } from '@/lib/redgifs';
import { downloadImgurInfo } from '@/lib/imgur';
import { downloadYouTubeInfo } from '@/lib/youtube';
import { downloadGfycatInfo } from '@/lib/gfycat';

/**
 * Запрос инфы о видео
 */
export async function getVideoInfo(props: { url: string; reddit: Reddit }) {
  const { url, reddit } = props;
  const idVideoSource = getVideoSource(url);

  let info: MediaSummaryPreview;
  if (idVideoSource === 'www.reddit.com') {
    info = await reddit.getInfo({ urlReddit: url });
  }
  if (idVideoSource === 'www.yaplakal.com') {
    info = await downloadYapPageInfo(url);
  }
  if (idVideoSource === 'www.redgifs.com') {
    info = await downloadRedGifsInfo(url);
  }
  if (idVideoSource === 'imgur.com') {
    info = await downloadImgurInfo(url);
  }
  if (idVideoSource === 'www.youtube.com') {
    info = await downloadYouTubeInfo(url);
  }
  if (idVideoSource === 'gfycat.com') {
    info = await downloadGfycatInfo(url);
  }
  return info;
}
