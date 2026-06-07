export type SnapshotStatus = 'new' | 'upgrade' | 'termin' | 'recurring' | 'prorate';
export type SnapshotType = 'internal' | 'resell';

export class Calculate {
    /**
     * MRC = subscription / monthPeriod
     */
    static mrc(subscription: number, monthPeriod: number): number {
        return subscription / (monthPeriod || 1);
    }

    /**
     * Komisi sales internal.
     * - upgrade/prorate: 20%
     * - new/termin + crossSell > 0: 15%, tanpa crossSell: 12%
     * - recurring: 1%
     * - Special: new > 12 bulan → 12 bulan pertama full, sisanya 1%
     */
    static internalSalesCommission(
        status: SnapshotStatus,
        dpp: number,
        crossSellCount: number,
        months: number
    ): { commissionAmount: number; commissionPercentage: number } {
        let commissionPercentage = 0;
        let commissionAmount = 0;

        if (status === 'upgrade' || status === 'prorate') {
            commissionPercentage = 20;
        } else if (status === 'new' || status === 'termin') {
            commissionPercentage = crossSellCount > 0 ? 15 : 12;
        } else if (status === 'recurring') {
            commissionPercentage = 1;
        } else {
            commissionPercentage = 1;
        }

        if (status === 'new' && months > 12) {
            const first12MonthsAmount = dpp * (12 / months);
            const remainingAmount = dpp - first12MonthsAmount;
            commissionAmount = (first12MonthsAmount * (commissionPercentage / 100)) + (remainingAmount * 0.01);
        } else {
            commissionAmount = dpp * (commissionPercentage / 100);
        }

        return { commissionAmount, commissionPercentage };
    }

    /**
     * Komisi sales resell + hitung margin sekaligus.
     * - price = subscription / totalAccount (null jika recurring)
     * - markup = price - modal (null jika recurring, 0 jika modal = 0)
     * - margin: (markup/price)*100, default 2.5% jika modal = 0
     * - Komisi: recurring 0.5%, margin >= 15% → 5%, >= 10% → 4%, < 10% → 2.5%
     */
    static resellSalesCommission(
        status: SnapshotStatus,
        subscription: number,
        totalAccount: number,
        modal: number
    ): { commissionAmount: number; commissionPercentage: number; price: number | null; markup: number | null; margin: number | null } {
        const isNewUpgradeProrate = ['new', 'prorate', 'upgrade'].includes(status);

        let price: number | null = null;
        let markup: number | null = null;
        let margin: number | null = null;

        if (isNewUpgradeProrate) {
            const account = totalAccount || 1;
            price = subscription / account;

            if (modal === 0) {
                markup = 0;
                margin = 2.5;
            } else {
                markup = price - modal;
                margin = price > 0 ? (markup / price) * 100 : 0;
            }
        }

        let commissionPercentage = 0;

        if (status === 'recurring') {
            commissionPercentage = 0.5;
        } else if (isNewUpgradeProrate || status === 'termin') {
            if ((margin ?? 0) >= 15) {
                commissionPercentage = 5;
            } else if ((margin ?? 0) >= 10) {
                commissionPercentage = 4;
            } else {
                commissionPercentage = 2.5;
            }
        } else {
            commissionPercentage = 2.5;
        }

        return {
            commissionAmount: subscription * (commissionPercentage / 100),
            commissionPercentage,
            price,
            markup,
            margin
        };
    }

    /**
     * Komisi implementator dengan prorata dan churn count.
     * - Prorata: dpp / monthPeriod (untuk new/upgrade/prorate/termin)
     * - recurring: 1%, churn > 0: 17.5% (base), tanpa churn: 20% (retention)
     */
    static implementatorCommission(
        status: SnapshotStatus,
        dpp: number,
        churnCount: number,
        monthPeriod: number
    ): { implementatorCommission: number; implementatorCommissionPercentage: number; type: 'base' | 'retention' | 'recurring' } {
        let proratedDpp = dpp;

        if (status === 'new' || status === 'upgrade' || status === 'prorate' || status === 'termin') {
            proratedDpp = dpp / (monthPeriod || 1);
        }

        let percentage = 0;
        let type: 'base' | 'retention' | 'recurring' = 'retention';

        if (status === 'recurring') {
            percentage = 1;
            type = 'recurring';
        } else if (churnCount > 0) {
            percentage = 17.5;
            type = 'base';
        } else {
            percentage = 20;
            type = 'retention';
        }

        return {
            implementatorCommission: proratedDpp * (percentage / 100),
            implementatorCommissionPercentage: percentage,
            type
        };
    }
}
