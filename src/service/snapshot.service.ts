import { ISnapshotRepository, ISnapshotService, SnapshotData } from '../interface/snapshot.interface';
import { CommissionCalculator } from '../helper/commission';
import { INisService } from '../interface/nis.interface';

export class SnapshotService implements ISnapshotService {
    constructor(
        private readonly snapshotRepository: ISnapshotRepository,
        private readonly nisService: INisService
    ) {}

    async getImplementatorInvoiceDetail(implementatorId: string, startDate: string, endDate: string): Promise<any> {
        const snapshots = await this.snapshotRepository.getSnapshotByImplementator(implementatorId, startDate, endDate);
        const churnCount = await this.nisService.getChurnCountByImplementator(implementatorId, startDate, endDate);

        let totalSubscription = 0;
        let totalMrc = 0;
        let totalCommission = 0;

        const invoice = snapshots.map(row => {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const mrc = subscription / monthPeriod;
            
            const { implementatorCommission, implementatorCommissionPercentage, type } = CommissionCalculator.calculateImplementatorCommission(
                row.status,
                subscription,
                churnCount,
                monthPeriod
            );

            // Calculation prorated subscription
            let proratedDpp = subscription;
            if (row.status === 'new' || row.status === 'upgrade') {
                proratedDpp = subscription / monthPeriod;
            }

            totalSubscription += subscription;
            totalMrc += mrc;
            totalCommission += implementatorCommission;

            return {
                ai: row.ai,
                invoiceNumber: row.invoice_number,
                sequenceNumber: row.sequence_number,
                paidDate: row.paid_date,
                status: row.status,
                monthPeriod: row.month_period,
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
                salesId: {
                    name: row.sales_name || '',
                    employeeId: row.sales_id || '',
                    photoProfile: row.sales_photo || ''
                },
                subscription: subscription,
                mrc: mrc,
                commissionPercentage: implementatorCommissionPercentage,
                commission: implementatorCommission
            };
        });

        return {
            invoice,
            churnCount,
            totalSubscription,
            totalMrc,
            totalCommission
        };
    }

    async getInternalInvoiceDetail(employeeId: string, startDate: string, endDate: string): Promise<any> {
        const snapshots = await this.snapshotRepository.getInternalInvoice(employeeId, startDate, endDate);

        let totalSubscription = 0;
        let totalMrc = 0;
        let totalCommission = 0;

        const invoice = snapshots.map(row => {
            const subscription = Number(row.subscription) || 0;
            const monthPeriod = Number(row.month_period) || 1;
            const mrc = row.status === 'recurring' ? 0 : (subscription / monthPeriod);

            const { commissionAmount, commissionPercentage } = CommissionCalculator.calculateSalesCommission(
                row.service_type,
                row.status,
                subscription,
                0, // Margin is not available yet, default to 0
                row.cross_sell_count,
                monthPeriod
            );

            totalSubscription += subscription;
            totalMrc += mrc;
            totalCommission += commissionAmount;

            return {
                ai: row.ai,
                invoiceNumber: row.invoice_number,
                sequenceNumber: row.sequence_number,
                paidDate: row.paid_date,
                status: row.status,
                monthPeriod: row.month_period,
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
                implementatorId: {
                    name: row.implementator_name || '',
                    employeeId: row.implementator_id || '',
                    photoProfile: row.implementator_photo_profile || ''
                },
                subscription: subscription,
                mrc: mrc,
                commissionPercentage: commissionPercentage,
                commission: commissionAmount
            };
        });

        return {
            invoice,
            totalSubscription,
            totalMrc,
            totalCommission
        };
    }

    async deleteSnapshotByDateRangeAndType(startDate: string, endDate: string, serviceType: 'internal' | 'resell'): Promise<any> {
        return await this.snapshotRepository.deleteSnapshotByDateRangeAndType(startDate, endDate, serviceType);
    }

    async insertSnapshot(data: SnapshotData): Promise<any> {
        return await this.snapshotRepository.insertSnapshot(data);
    }
}
