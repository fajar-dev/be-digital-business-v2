import { nisPool } from "../config/database";

export class NisService {
    constructor() {}

    async getInternalByDateRange(startDate: string, endDate: string) {
        const query = `
            SELECT 
                COALESCE(csh.ContractUntil, cs.ContractUntil) AS contract_until,
                nciit.AI AS ai,
                nciit.counter AS counter,
                nciit.new_subscription AS new_subscription,
                nciit.dpp AS dpp,
                nciit.is_prorata AS is_prorated,
                nciit.is_upgrade AS is_upgrade,
                nciit.trx_date AS transaction_date,
                cit.InvoiceNum AS invoice_number,
                cit.AwalPeriode AS period_start,
                cit.AkhirPeriode AS period_end,
                cs.CustServId AS customer_service_id,
                cs.SalesId AS sales_id,
                cs.ManagerSalesId AS sales_manager_id,
                c.CustId AS customer_id,
                c.CustCompany AS customer_company,
                s.ServiceId AS service_id,
                s.ServiceType AS service_type,
                s.ServiceLevel AS service_level,
                s.BusinessOperation AS business_operation,
                c.Surveyor AS surveyor,
                itm.Month AS month,
                nci.Description AS description,
                cit.Urut AS sequence_number,
                COALESCE(cs.ResellerType, c.ResellerType) AS reseller_type,
                COALESCE(cs.ResellerTypeId, c.ResellerId) AS reseller_type_id,
                COALESCE(cross_tbl.cross_sell_count, 0) AS cross_sell_count
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

        const [rows] = await nisPool.query({
            sql: query,
        }, [startDate, endDate]);

        return rows as any[];
    }

}