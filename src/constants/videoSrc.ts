/* eslint-disable no-useless-escape */
export interface VideoSource {
  pattern: RegExp;
}

const VIDEO_SOURCES = new Map<string, VideoSource>();

VIDEO_SOURCES.set('www.reddit.com', {
  pattern: /https:\/\/www.reddit.com\/r\/\w+\/comments\/\w+\/[a-zа-яёА-ЯЁA-Z0-9_%]+\//,
});
VIDEO_SOURCES.set('www.yaplakal.com', {
  pattern: /https:\/\/www.yaplakal.com\/forum[0-9]+\/(st\/[0-9]+\/)?topic[0-9]+.html/,
});
VIDEO_SOURCES.set('www.redgifs.com', {
  pattern: /https:\/\/(www\.)?redgifs.com\/watch\/\w+/,
});
VIDEO_SOURCES.set('imgur.com', {
  pattern: /https:\/\/(i\.)?imgur.com\/\w+(.gifv)?/,
});
VIDEO_SOURCES.set('www.youtube.com', {
  pattern:
    /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
});
VIDEO_SOURCES.set('gfycat.com', {
  pattern: /https:\/\/(www\.)?gfycat.com/,
});

export { VIDEO_SOURCES };
