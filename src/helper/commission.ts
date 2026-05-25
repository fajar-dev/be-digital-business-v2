export type SnapshotStatus = 'new' | 'upgrade' | 'termin' | 'recurring' | 'prorate';
export type SnapshotType = 'internal' | 'resell';

export class CommissionCalculator {
    /**
     * Calculate sales commission based on product type and predefined business rules.
     */
    static calculateSalesCommission(
        type: SnapshotType,
        status: SnapshotStatus,
        dpp: number,
        margin: number,
        crossSellCount: number,
        subscriptionMonths: number
    ): { commissionAmount: number; commissionPercentage: number } {
        if (type === 'internal') {
            return this.calculateInternalCommission(status, dpp, crossSellCount, subscriptionMonths);
        } else {
            return this.calculateResellCommission(status, dpp, margin);
        }
    }

    private static calculateInternalCommission(
        status: SnapshotStatus,
        dpp: number,
        crossSellCount: number,
        months: number
    ) {
        let commissionPercentage = 0;
        let commissionAmount = 0;

        // Determine percentage based on status
        if (status === 'upgrade' || status === 'prorate') {
            commissionPercentage = 20;
        } else if (status === 'new' || status === 'termin') {
            commissionPercentage = crossSellCount > 0 ? 15 : 12;
        } else if (status === 'recurring') {
            commissionPercentage = 1;
        } else {
            commissionPercentage = 1; // Default fallback
        }

        // Special rule for new subscriptions paid upfront for > 12 months
        if (status === 'new' && months > 12) {
            const first12MonthsAmount = dpp * (12 / months);
            const remainingAmount = dpp - first12MonthsAmount;
            
            // First 12 months get full commission, remaining gets 1% recurring
            commissionAmount = (first12MonthsAmount * (commissionPercentage / 100)) + (remainingAmount * 0.01);
        } else {
            commissionAmount = dpp * (commissionPercentage / 100);
        }

        return { commissionAmount, commissionPercentage };
    }

    private static calculateResellCommission(
        status: SnapshotStatus,
        dpp: number,
        margin: number
    ) {
        let commissionPercentage = 0;

        if (status === 'recurring') {
            commissionPercentage = 0.5;
        } else if (status === 'new' || status === 'upgrade' || status === 'prorate' || status === 'termin') {
            // Tiered percentage based on margin
            if (margin >= 15) {
                commissionPercentage = 5;
            } else if (margin >= 10) {
                commissionPercentage = 4;
            } else {
                commissionPercentage = 2.5;
            }
        } else {
            commissionPercentage = 2.5; // Default fallback
        }

        return { 
            commissionAmount: dpp * (commissionPercentage / 100), 
            commissionPercentage 
        };
    }

    /**
     * Calculate implementator commission with prorata and churn count logic.
     */
    static calculateImplementatorCommission(
        status: SnapshotStatus,
        dpp: number,
        churnCount: number,
        monthPeriod: number
    ): { implementatorCommission: number; implementatorCommissionPercentage: number; type: 'base' | 'retention' | 'recurring' } {
        let proratedDpp = dpp;
        
        // Prorate for new or upgrade
        if (status === 'new' || status === 'upgrade' || status === 'prorate' || status === 'termin') {
            const period = monthPeriod || 1;
            proratedDpp = dpp / period;
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
