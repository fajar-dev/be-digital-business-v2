import { dashboardPool } from '../config/database';

export interface SnapshotData {
    ai: number;
    invoice_number: number | null;
    sequence_number: number | null;
    paid_date: Date | string | null;
    dpp: number | null;
    status: 'new' | 'upgrade' | 'termin' | 'recurring' | 'prorate';
    month_period: number | null;
    total_account: number | null;
    customer_id: string | null;
    customer_service_id: number | null;
    customer_company: string | null;
    contract_until_date: Date | string | null;
    service_group_id: string | null;
    service_id: string | null;
    service_name: string | null;
    service_type: 'internal' | 'resell';
    cross_sell_count: number;
    sales_id: string | null;
    manager_sales_id: string | null;
    implementator_id: string | null;
}

export class InvoiceService {
    constructor() {}

    async deleteSnapshotByDateRangeAndType(startDate: string, endDate: string, serviceType: 'internal' | 'resell') {
        const query = `
            DELETE FROM snapshots
            WHERE service_type = ? AND paid_date BETWEEN ? AND ?
        `;
        const [result] = await dashboardPool.query(query, [serviceType, startDate, endDate]);
        return result;
    }

    async insertSnapshot(data: SnapshotData) {
        const query = `
            INSERT INTO snapshots (
                ai, invoice_number, sequence_number, paid_date, dpp,
                status, month_period, total_account, customer_id, customer_service_id,
                customer_company, contract_until_date, service_group_id, service_id,
                service_name, service_type, cross_sell_count, sales_id, manager_sales_id, implementator_id
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            ) ON DUPLICATE KEY UPDATE
                invoice_number = VALUES(invoice_number),
                sequence_number = VALUES(sequence_number),
                paid_date = VALUES(paid_date),
                dpp = VALUES(dpp),
                status = VALUES(status),
                month_period = VALUES(month_period),
                total_account = VALUES(total_account),
                customer_id = VALUES(customer_id),
                customer_service_id = VALUES(customer_service_id),
                customer_company = VALUES(customer_company),
                contract_until_date = VALUES(contract_until_date),
                service_group_id = VALUES(service_group_id),
                service_id = VALUES(service_id),
                service_name = VALUES(service_name),
                service_type = VALUES(service_type),
                cross_sell_count = VALUES(cross_sell_count),
                sales_id = VALUES(sales_id),
                manager_sales_id = VALUES(manager_sales_id),
                implementator_id = VALUES(implementator_id)
        `;

        const values = [
            data.ai,
            data.invoice_number,
            data.sequence_number,
            data.paid_date,
            data.dpp,
            data.status,
            data.month_period,
            data.total_account,
            data.customer_id,
            data.customer_service_id,
            data.customer_company,
            data.contract_until_date,
            data.service_group_id,
            data.service_id,
            data.service_name,
            data.service_type,
            data.cross_sell_count,
            data.sales_id,
            data.manager_sales_id,
            data.implementator_id
        ];

        const [result] = await dashboardPool.query(query, values);
        return result;
    }
}
