import { NisService } from '../service/nis.service';
import { NisRepository } from '../repository/nis.repository';
import { SnapshotService } from '../service/snapshot.service';
import { SnapshotRepository } from '../repository/snapshot.repository';
import { dashboardPool, nisPool } from '../config/database';
import { PeriodHelper } from '../helper/period';

const snapshotRepository = new SnapshotRepository(dashboardPool);
const snapshotService = new SnapshotService(snapshotRepository);
const nisRepository = new NisRepository(nisPool);
const nisService = new NisService(nisRepository);
const periodHelper = new PeriodHelper();

async function syncInternalInvoices() {
    console.log('[SYNC] Starting internal invoice synchronization from NIS...');
    
    // Default to current month period if not provided
    const currentPeriod = periodHelper.getStartAndEndDateForCurrentMonth();
    const startDate = process.argv[2] || currentPeriod.startDate;
    const endDate = process.argv[3] || currentPeriod.endDate;

    try {
        console.log(`[SYNC] Deleting existing internal invoices from ${startDate} to ${endDate}...`);
        await snapshotService.deleteSnapshotByDateRangeAndType(startDate, endDate, 'internal');

        console.log(`[SYNC] Fetching internal invoices from ${startDate} to ${endDate}...`);
        const rows = await nisService.getInternalByDateRange(startDate, endDate);
        console.log(`[SYNC] Found ${rows.length} internal invoices.`);

        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            try {
                // Selisih bulan dari aktivasi ke awal periode invoice
                let activationMonthDiff = -1;
                if (row.activation_date && row.period_start) {
                    const activationDate = new Date(row.activation_date);
                    const startStr = String(row.period_start);
                    const startYear = Number(startStr.slice(0, 4));
                    const startMonth = Number(startStr.slice(4, 6));

                    if (Number.isFinite(startYear) && Number.isFinite(startMonth)) {
                        activationMonthDiff = (startYear - activationDate.getFullYear()) * 12 +
                            (startMonth - (activationDate.getMonth() + 1));
                    }
                }

                let isUnderContract = false;
                if (row.contract_until && row.period_start) {
                    const contractDate = new Date(row.contract_until);
                    if (!isNaN(contractDate.getTime())) {
                        contractDate.setHours(23, 59, 59, 999);
                        const startStr = String(row.period_start);
                        const startYear = Number(startStr.slice(0, 4));
                        const startMonth = Number(startStr.slice(4, 6));
                        const startDay = startStr.length >= 8 ? Number(startStr.slice(6, 8)) : 1;

                        if (Number.isFinite(startYear) && Number.isFinite(startMonth)) {
                            const awalDate = new Date(startYear, startMonth - 1, startDay);
                            if (awalDate <= contractDate) {
                                isUnderContract = true;
                            }
                        }
                    }
                }

                let status = 'recurring';
                if (row.service_group_id === 'NW' && /\btermin\b(?!\w)/i.test(row.description || '')) {
                    status = 'termin';
                } else if (row.new_subscription > 0 && row.is_upgrade === 0 && row.is_prorata === 0) {
                    status = 'new';
                } else if (row.is_upgrade === 1 && row.is_prorata === 0) {
                    status = 'upgrade';
                } else if (row.is_prorata === 1) {
                    status = 'prorate';
                } else if (isUnderContract && activationMonthDiff > 0) {
                    status = 'termin';
                } else if (!isUnderContract && activationMonthDiff > 0) {
                    status = 'recurring';
                } else if (row.is_upgrade === 0 && row.is_prorata === 0 && row.new_subscription === 0) {
                    status = 'recurring';
                }

                let monthPeriod = row.month;
                if (row.service_group_id === 'NW' && row.month > 12) {
                    monthPeriod = 12;
                }

                await snapshotService.insertSnapshot({
                    ai: row.ai,
                    invoice_number: row.invoice_number,
                    sequence_number: row.sequence_number,
                    paid_date: row.paid_date,
                    subscription: row.subscription,
                    status: status as any,
                    month_period: monthPeriod,
                    total_account: row.total_account,
                    customer_id: row.customer_id,
                    customer_service_id: row.customer_service_id,
                    customer_company: row.customer_company,
                    contract_until_date: row.contract_until,
                    service_group_id: row.service_group_id,
                    service_id: row.service_id,
                    service_name: row.service_name,
                    service_type: 'internal',
                    cross_sell_count: row.cross_sell_count,
                    sales_id: row.sales_id,
                    manager_sales_id: row.sales_manager_id,
                    implementator_id: row.implementator_id
                });
                successCount++;
            } catch (err: any) {
                console.error(`[SYNC ERROR] Failed to insert snapshot for AI ${row.ai}: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`[SYNC] Completed! Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error: any) {
        console.error(`[SYNC FATAL ERROR] Synchronization failed: ${error.message}`);
    } finally {
        process.exit(0);
    }
}

syncInternalInvoices();
