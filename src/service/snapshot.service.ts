import { ISnapshotRepository, ISnapshotService, SnapshotData } from '../interface/snapshot.interface';
import { Calculate } from '../helper/calculate';
import { INisService } from '../interface/nis.interface';

export class SnapshotService implements ISnapshotService {
    constructor(
        private readonly snapshotRepository: ISnapshotRepository,
        private readonly nisService: INisService
    ) {}

    async getImplementatorInvoiceDetail(implementatorId: string, startDate: string, endDate: string): Promise<any> {
        const snapshots = await this.snapshotRepository.getSnapshotByImplementator(implementatorId, startDate, endDate);
        const churnCount = await this.nisService.getChurnCountByImplementator(implementatorId, startDate, endDate);

        return snapshots.map(row => {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;

            const { implementatorCommission, implementatorCommissionPercentage } = Calculate.implementatorCommission(
                row.status, subscription, churnCount, monthPeriod
            );

            return {
                ai: row.ai,
                invoiceNumber: row.invoice_number,
                sequenceNumber: row.sequence_number,
                paidDate: row.paid_date,
                status: row.status,
                monthPeriod: row.month_period,
                monthPeriodSummary: Calculate.monthPeriodSummary(monthPeriod),
                totalAccount: row.total_account,
                customerId: row.customer_id,
                customerServiceId: row.customer_service_id,
                customerCompany: row.customer_company,
                contractUntilDate: row.contract_until_date,
                serviceGroupId: row.service_group_id,
                serviceId: row.service_id,
                serviceName: row.service_name,
                serviceType: row.service_type,
                crossSellCount: row.cross_sell_count,
                sales: {
                    name: row.sales_name || '',
                    employeeId: row.sales_id || '',
                    photoProfile: row.sales_photo || ''
                },
                subscription,
                mrc: Calculate.mrc(subscription, monthPeriod),
                commissionPercentage: implementatorCommissionPercentage,
                commission: implementatorCommission
            };
        });
    }

    async getImplementatorCommissionSummary(implementatorId: string, startDate: string, endDate: string): Promise<any> {
        // Hitung periode bulan lalu
        const start = new Date(startDate);
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - (Math.round((new Date(endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
        const prevStartDate = prevStart.toISOString().split('T')[0];
        const prevEndDate = prevEnd.toISOString().split('T')[0];

        const [current, previous] = await Promise.all([
            this.aggregateImplementatorCommission(implementatorId, startDate, endDate),
            this.aggregateImplementatorCommission(implementatorId, prevStartDate, prevEndDate)
        ]);

        return {
            commission: {
                new: Calculate.trend(current.commissionNew, previous.commissionNew),
                recurring: Calculate.trend(current.commissionRecurring, previous.commissionRecurring),
                total: Calculate.trend(current.commissionNew + current.commissionRecurring, previous.commissionNew + previous.commissionRecurring)
            },
            mrc: Calculate.trend(current.totalMrc, previous.totalMrc),
            subscription: Calculate.trend(current.totalSubscription, previous.totalSubscription),
            churnCount: Calculate.trend(current.churnCount, previous.churnCount),
            newAccount: Calculate.trend(current.newAccount, previous.newAccount)
        };
    }

    private async aggregateImplementatorCommission(implementatorId: string, startDate: string, endDate: string) {
        const snapshots = await this.snapshotRepository.getSnapshotByImplementator(implementatorId, startDate, endDate);
        const churnCount = await this.nisService.getChurnCountByImplementator(implementatorId, startDate, endDate);

        let commissionNew = 0;
        let commissionRecurring = 0;
        let totalMrc = 0;
        let totalSubscription = 0;
        let newAccount = 0;

        for (const row of snapshots) {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const status = row.status;

            const { implementatorCommission } = Calculate.implementatorCommission(
                status, subscription, churnCount, monthPeriod
            );

            if (status === 'recurring') {
                commissionRecurring += implementatorCommission;
            } else if (['new', 'prorate', 'upgrade', 'termin'].includes(status)) {
                commissionNew += implementatorCommission;
                totalMrc += Calculate.mrc(subscription, monthPeriod);
                totalSubscription += subscription;
            }

            if (['new', 'upgrade', 'prorate', 'termin'].includes(status)) newAccount += Number(row.total_account) || 0;
        }

        return { commissionNew, commissionRecurring, totalMrc, totalSubscription, churnCount, newAccount };
    }

    async getSalesCommissionSummary(employeeId: string, startDate: string, endDate: string): Promise<any> {
        // Hitung periode bulan lalu dari startDate
        const start = new Date(startDate);
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - (Math.round((new Date(endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
        const prevStartDate = prevStart.toISOString().split('T')[0];
        const prevEndDate = prevEnd.toISOString().split('T')[0];

        const [current, previous] = await Promise.all([
            this.aggregateSalesCommission(employeeId, startDate, endDate),
            this.aggregateSalesCommission(employeeId, prevStartDate, prevEndDate)
        ]);

        return {
            commission: {
                new: Calculate.trend(current.commissionNew, previous.commissionNew),
                recurring: Calculate.trend(current.commissionRecurring, previous.commissionRecurring),
                total: Calculate.trend(current.commissionNew + current.commissionRecurring, previous.commissionNew + previous.commissionRecurring)
            },
            mrc: Calculate.trend(current.totalMrc, previous.totalMrc),
            subscription: Calculate.trend(current.totalSubscription, previous.totalSubscription),
            newCustomer: Calculate.trend(current.newCustomer, previous.newCustomer),
            newAccount: Calculate.trend(current.newAccount, previous.newAccount)
        };
    }

    private async aggregateSalesCommission(employeeId: string, startDate: string, endDate: string) {
        const [internalSnapshots, resellSnapshots] = await Promise.all([
            this.snapshotRepository.getInternalInvoice(employeeId, startDate, endDate),
            this.snapshotRepository.getResellInvoice(employeeId, startDate, endDate)
        ]);

        let commissionNew = 0;
        let commissionRecurring = 0;
        let totalMrc = 0;
        let totalSubscription = 0;
        let newAccount = 0;
        const newCustomerIds = new Set<string>();

        for (const row of internalSnapshots) {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const status = row.status;

            const { commissionAmount } = Calculate.internalSalesCommission(
                status, subscription, row.cross_sell_count, monthPeriod
            );

            if (status === 'recurring') {
                commissionRecurring += commissionAmount;
            } else if (['new', 'prorate', 'upgrade', 'termin'].includes(status)) {
                commissionNew += commissionAmount;
                totalMrc += Calculate.mrc(subscription, monthPeriod);
                totalSubscription += subscription;
            }

            if (status === 'new' && row.customer_id) newCustomerIds.add(row.customer_id);
            if (['new', 'upgrade', 'prorate', 'termin'].includes(status)) newAccount += Number(row.total_account) || 0;
        }

        for (const row of resellSnapshots) {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const status = row.status;

            const { commissionAmount } = Calculate.resellSalesCommission(
                status, subscription, Number(row.total_account) || 1, Number(row.modal) || 0
            );

            if (status === 'recurring') {
                commissionRecurring += commissionAmount;
            } else if (['new', 'prorate', 'upgrade', 'termin'].includes(status)) {
                commissionNew += commissionAmount;
                totalMrc += Calculate.mrc(subscription, monthPeriod);
                totalSubscription += subscription;
            }

            if (status === 'new' && row.customer_id) newCustomerIds.add(row.customer_id);
            if (['new', 'upgrade', 'prorate', 'termin'].includes(status)) newAccount += Number(row.total_account) || 0;
        }

        return { commissionNew, commissionRecurring, totalMrc, totalSubscription, newCustomer: newCustomerIds.size, newAccount };
    }

    async getInternalInvoiceDetail(employeeId: string, startDate: string, endDate: string): Promise<any> {
        const snapshots = await this.snapshotRepository.getInternalInvoice(employeeId, startDate, endDate);

        return snapshots.map(row => {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;

            const { commissionAmount, commissionPercentage } = Calculate.internalSalesCommission(
                row.status, subscription, row.cross_sell_count, monthPeriod
            );

            return {
                ai: row.ai,
                invoiceNumber: row.invoice_number,
                sequenceNumber: row.sequence_number,
                paidDate: row.paid_date,
                status: row.status,
                monthPeriod: row.month_period,
                monthPeriodSummary: Calculate.monthPeriodSummary(monthPeriod),
                totalAccount: row.total_account,
                customerId: row.customer_id,
                customerServiceId: row.customer_service_id,
                customerCompany: row.customer_company,
                contractUntilDate: row.contract_until_date,
                serviceGroupId: row.service_group_id,
                serviceId: row.service_id,
                serviceName: row.service_name,
                serviceType: row.service_type,
                crossSellCount: row.cross_sell_count,
                implementator: {
                    name: row.implementator_name || '',
                    employeeId: row.implementator_id || '',
                    photoProfile: row.implementator_photo_profile || ''
                },
                subscription,
                mrc: row.status === 'recurring' ? 0 : Calculate.mrc(subscription, monthPeriod),
                commissionPercentage,
                commission: commissionAmount
            };
        });
    }

    async getResellInvoiceDetail(employeeId: string, startDate: string, endDate: string): Promise<any> {
        const snapshots = await this.snapshotRepository.getResellInvoice(employeeId, startDate, endDate);

        return snapshots.map(row => {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const modal = Number(row.modal) || 0;

            const { commissionAmount, commissionPercentage, price, markup, margin } = Calculate.resellSalesCommission(
                row.status, subscription, Number(row.total_account) || 1, modal
            );

            return {
                ai: row.ai,
                invoiceNumber: row.invoice_number,
                sequenceNumber: row.sequence_number,
                paidDate: row.paid_date,
                status: row.status,
                monthPeriod: row.month_period,
                monthPeriodSummary: Calculate.monthPeriodSummary(monthPeriod),
                totalAccount: row.total_account,
                customerId: row.customer_id,
                customerServiceId: row.customer_service_id,
                customerCompany: row.customer_company,
                serviceGroupId: row.service_group_id,
                serviceId: row.service_id,
                serviceName: row.service_name,
                serviceType: row.service_type,
                subscription,
                modal,
                price,
                markup,
                margin,
                mrc: Calculate.mrc(subscription, monthPeriod),
                commissionPercentage,
                commission: commissionAmount
            };
        });
    }

    async deleteSnapshotByDateRangeAndType(startDate: string, endDate: string, serviceType: 'internal' | 'resell'): Promise<any> {
        return await this.snapshotRepository.deleteSnapshotByDateRangeAndType(startDate, endDate, serviceType);
    }

    async insertSnapshot(data: SnapshotData): Promise<any> {
        return await this.snapshotRepository.insertSnapshot(data);
    }
}
