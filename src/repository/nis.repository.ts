import { Pool } from 'mysql2/promise';
import { INisRepository } from '../interface/nis.interface';

export class NisRepository implements INisRepository {
    constructor(private readonly dbPool: Pool) {}

    async getInternalByDateRange(startDate: string, endDate: string): Promise<any[]> {
        const query = `
            SELECT 
                nciit.AI AS ai,
                nciit.counter AS counter,
                cit.InvoiceNum AS invoice_number,
                cit.Urut AS sequence_number,
                nciit.trx_date AS paid_date,
                nci.Description AS description,
                nciit.new_subscription AS new_subscription,
                nciit.dpp AS subscription,
                nciit.is_prorata AS is_prorate,
                nciit.is_upgrade AS is_upgrade,
                itm.Month AS month,
                cit.AwalPeriode AS period_start,
                cit.AkhirPeriode AS period_end,
                cit.total_account AS total_account,
                c.CustId AS customer_id,
                cs.CustServId AS customer_service_id,
                c.CustCompany AS customer_company,
                cs.CustActivationDate AS activation_date,
                COALESCE(csh.ContractUntil, cs.ContractUntil) AS contract_until,
                s.ServiceGroup AS service_group_id,
                s.ServiceId AS service_id,
                s.ServiceType AS service_name,
                s.BusinessOperation AS service_type,
                COALESCE(cross_tbl.cross_sell_count, 0) AS cross_sell_count,
                cs.SalesId AS sales_id,
                cs.ManagerSalesId AS sales_manager_id,
                c.Surveyor AS implementator_id
            FROM NewCustomerInvoiceInternetCounter nciit
            LEFT JOIN NewCustomerInvoice nci 
                ON nciit.AI = nci.AI
            LEFT JOIN CustomerInvoiceTemp cit 
                ON nci.Id = cit.InvoiceNum AND nci.No = cit.Urut
            LEFT JOIN InvoiceTypeMonth itm 
                ON cit.InvoiceType = itm.InvoiceType
            LEFT JOIN CustomerInvoiceTemp_Custom citc 
                ON cit.InvoiceNum = citc.InvoiceNum AND cit.Urut = citc.Urut
            LEFT JOIN CustomerServices cs 
                ON cs.CustId = nci.CustId AND cs.ServiceId = cit.ServiceId
            LEFT JOIN (
                SELECT CustServId, MIN(ContractUntil) AS ContractUntil
                FROM CustomerServicesHistory
                WHERE ContractUntil IS NOT NULL
                GROUP BY CustServId
            ) AS csh 
                ON csh.CustServId = cs.CustServId
            LEFT JOIN Customer c 
                ON c.CustId = nci.CustId
            LEFT JOIN Services s 
                ON cs.ServiceId = s.ServiceId
            LEFT JOIN (
                SELECT cs2.CustId, COUNT(*) AS cross_sell_count
                FROM CustomerServices cs2
                JOIN Services s2 ON cs2.ServiceId = s2.ServiceId
                WHERE (cs2.CustStatus IS NULL OR cs2.CustStatus <> 'NA')
                AND s2.BusinessOperation = 'resell'
                GROUP BY cs2.CustId
            ) AS cross_tbl 
                ON cross_tbl.CustId = nci.CustId
            WHERE s.BusinessOperation = 'internal'
            AND s.ServiceCategory = 'digital_business'
            AND nciit.trx_date BETWEEN ? AND ?
            GROUP BY nciit.AI;
        `;

        const [rows] = await this.dbPool.query({
            sql: query,
        }, [startDate, endDate]);

        return rows as any[];
    }

    async getChurnCountByImplementator(implementatorId: string, startDate: string, endDate: string): Promise<number> {
        const query = `
            SELECT COUNT(*) AS total
            FROM CustomerServices cs
            LEFT JOIN Customer c ON c.CustId = cs.CustId
            WHERE cs.ServiceId IN ('NWBUS', 'NWADV')
            AND c.Surveyor = ?
            AND cs.CustStatus = 'NA'
            AND cs.CustUnregDate BETWEEN ? AND ?;
        `;
        const [rows] = await this.dbPool.query(query, [implementatorId, startDate, endDate]);
        const data = rows as any[];
        return data.length > 0 ? Number(data[0].total) : 0;
    }
}
