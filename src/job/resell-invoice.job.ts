import { NisService } from '../service/nis.service';
import { NisRepository } from '../repository/nis.repository';
import { SnapshotService } from '../service/snapshot.service';
import { SnapshotRepository } from '../repository/snapshot.repository';
import { dashboardPool, nisPool } from '../config/database';
import { PeriodHelper } from '../helper/period';

const nisRepository = new NisRepository(nisPool);
const nisService = new NisService(nisRepository);
const snapshotRepository = new SnapshotRepository(dashboardPool);
const snapshotService = new SnapshotService(snapshotRepository, nisService);
const periodHelper = new PeriodHelper();

async function syncResellInvoices() {
    console.log('[SYNC] Starting resell invoice synchronization from NIS...');
    
    // Default to current month period if not provided
    const currentPeriod = periodHelper.getStartAndEndDateForCurrentMonth();
    const startDate = process.argv[2] || currentPeriod.startDate;
    const endDate = process.argv[3] || currentPeriod.endDate;

    try {
        console.log(`[SYNC] Deleting existing resell invoices from ${startDate} to ${endDate}...`);
        await snapshotService.deleteSnapshotByDateRangeAndType(startDate, endDate, 'resell');

        console.log(`[SYNC] Fetching resell invoices from ${startDate} to ${endDate}...`);
        const rows = await nisService.getResellByDateRange(startDate, endDate);
        console.log(`[SYNC] Found ${rows.length} resell invoices.`);

        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            try {
                let status = 'recurring';
                if (row.new_subscription > 0 && row.is_upgrade === 0 && row.is_prorate === 0) {
                    status = 'new';
                } else if (row.is_upgrade === 1 && row.is_prorate === 0) {
                    status = 'upgrade';
                } else if (row.is_prorate === 1 && row.is_upgrade === 0) {
                    status = 'prorate';
                } else if (row.is_upgrade === 0 && row.is_prorate === 0 && row.new_subscription === 0) {
                    status = 'recurring';
                }

                await snapshotService.insertSnapshot({
                    ai: row.ai,
                    invoice_number: row.invoice_number,
                    sequence_number: row.sequence_number,
                    paid_date: row.paid_date,
                    subscription: row.subscription,
                    status: status as any,
                    month_period: row.month,
                    total_account: row.total_account,
                    customer_id: row.customer_id,
                    customer_service_id: row.customer_service_id,
                    customer_company: row.customer_company,
                    contract_until_date: null,
                    service_group_id: row.service_group_id,
                    service_id: row.service_id,
                    service_name: row.service_name,
                    service_type: 'resell',
                    cross_sell_count: 0,
                    sales_id: row.sales_id,
                    manager_sales_id: row.sales_manager_id,
                    implementator_id: null,
                    modal: Number(row.modal) || 0
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

syncResellInvoices();
