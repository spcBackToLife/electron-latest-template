import dayjs, { Dayjs } from 'dayjs';

export enum FormatStyle {
    YYYYMMDDHHmmss = 'YYYY-MM-DD HH:mm:ss',
    YYYYMMDD = 'YYYY-MM-DD',
    HHmmss = 'HH:mm:ss',
}

export const formateDate = (
    date: string | number | Date | dayjs.Dayjs | null | undefined,
    format: FormatStyle
) => {
    if (!date) {
        return '-';
    }
    const curDate = typeof date === 'number' ? date * 1000 : date;
    return dayjs(curDate).format(format);
};

export const getNextYear = (next: number, time: number) => {
    const curTime = dayjs(time * 1000).add(next, 'year');
    return curTime.unix();
};

/** x 为天数 */
export function isWithinXDays(date: Dayjs, x: number): boolean {
    const now = dayjs();
    const givenDate = date;
    const diffInDays = now.diff(givenDate, 'day');
    return diffInDays <= x;
}
