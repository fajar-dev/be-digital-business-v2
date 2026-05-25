import { format } from 'date-fns';

export class PeriodHelper {
    constructor() {}

    getStartAndEndDateForCurrentMonth() {
        const today = new Date();
        let targetMonth = today.getMonth();
        let targetYear = today.getFullYear();

        // Jika hari ini tanggal > 25, maka masuk periode bulan depan
        if (today.getDate() > 25) {
            targetMonth += 1;
            if (targetMonth > 11) {
                targetMonth = 0;
                targetYear += 1;
            }
        }
    
        const startMonth = targetMonth === 0 ? 11 : targetMonth - 1;
        const startYear = targetMonth === 0 ? targetYear - 1 : targetYear;
    
        const startDate = new Date(startYear, startMonth, 26);
        const endDate = new Date(targetYear, targetMonth, 25);
    
        return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
        };
    }

    getStartAndEndDateForPreviousMonth() {
        const today = new Date();
        let targetMonth = today.getMonth();
        let targetYear = today.getFullYear();

        if (today.getDate() > 25) {
            targetMonth += 1;
            if (targetMonth > 11) {
                targetMonth = 0;
                targetYear += 1;
            }
        }
    
        const startMonth = targetMonth === 0 ? 11 : targetMonth - 1;
        const startYear = targetMonth === 0 ? targetYear - 1 : targetYear;
    
        const startDate = new Date(startYear, startMonth, 26);
        const endDate = new Date(targetYear, targetMonth, 25);
    
        return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
        };
    }

    getStartAndEndDateForMonth(year: number, month: number) {
        // month: 1 = January, 12 = December, dst
        const startMonth = month === 1 ? 11 : month - 2;
        const startYear = month === 1 ? year - 1 : year;

        const startDate = new Date(startYear, startMonth, 26);
        const endDate = new Date(year, month - 1, 25);

        return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
        };
    }

    getPeriodByDate(date: Date) {
        let monthIndex = date.getMonth();
        let year = date.getFullYear();

        if (date.getDate() > 25) {
            monthIndex += 1;
            if (monthIndex > 11) {
                monthIndex = 0;
                year += 1;
            }
        }
        return {
            year,
            month: monthIndex + 1,
            startDate: this.getStartAndEndDateForMonth(year, monthIndex + 1).startDate,
            endDate: this.getStartAndEndDateForMonth(year, monthIndex + 1).endDate
        };
    }

    getPeriodFromQuery(monthQuery?: string | number | null, yearQuery?: string | number | null) {
        const today = new Date();
        const month = monthQuery ? Number(monthQuery) : today.getMonth() + 1;
        const year = yearQuery ? Number(yearQuery) : today.getFullYear();

        const { startDate, endDate } = this.getStartAndEndDateForMonth(year, month);

        return {
            year,
            month,
            startDate,
            endDate
        };
    }
}
