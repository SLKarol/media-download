import { readFile } from 'fs/promises';
import { resolve, join } from 'path';

type Holidays = {
  holidays: string[];
  day: number;
  month: number;
};

export async function getHolydaysToday() {
  const dataPath =
    process.env.NODE_ENV === 'development'
      ? resolve(__dirname, '../../src/resources')
      : resolve(process.resourcesPath, 'resources');
  try {
    const file = await readFile(join(dataPath, 'holidays.json'));
    const array = JSON.parse(file.toString()) as Holidays[];
    const now = new Date();
    const month = 1 + now.getMonth();
    const day = now.getDate();
    const data = array.find((v) => v.day === day && v.month === month);
    return data ? data.holidays.map((h) => h) : [];
  } catch (e) {
    return [];
  }
}
