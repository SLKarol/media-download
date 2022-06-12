import type { FormStateSettings } from '@/types/settings';

const yapForumPattern = /https:\/\/www.yaplakal.com\/forum[0-9]+\/$/;

export function saveSettingsToConfig(data: FormStateSettings) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { redditPasswordConfirm, yapForums, ...dataSettings } = data;
  const settingsListYapForums: { [U: string]: string } = yapForums.reduce((acc, val) => {
    const { description, url } = val;
    if (description.length > 0 && yapForumPattern.test(url)) {
      acc[val.url] = val.description;
    }
    return acc;
  }, {} as { [U: string]: string });

  window.electron.ipcRenderer.settingsSave({
    ...dataSettings,
    yaPlakal: { listForums: settingsListYapForums },
  });
}
