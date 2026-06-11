export interface SnapshotData {
    ai: number;
    invoice_number: number | null;
    sequence_number: number | null;
    paid_date: Date | string | null;
    subscription: number | null;
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
    modal: number | null;
}

export interface ISnapshotRepository {
    getInternalInvoice(salesId: string, startDate: string, endDate: string): Promise<any[]>;
    getResellInvoice(salesId: string, startDate: string, endDate: string): Promise<any[]>;
    getSnapshotByImplementator(implementatorId: string, startDate: string, endDate: string): Promise<any[]>;
    deleteSnapshotByDateRangeAndType(startDate: string, endDate: string, serviceType: 'internal' | 'resell'): Promise<any>;
    insertSnapshot(data: SnapshotData): Promise<any>;
}

export interface ISnapshotService {
    getInternalInvoiceDetail(employeeId: string, startDate: string, endDate: string): Promise<any>;
    getResellInvoiceDetail(employeeId: string, startDate: string, endDate: string): Promise<any>;
    getImplementatorInvoiceDetail(implementatorId: string, startDate: string, endDate: string): Promise<any>;
    getImplementatorCommissionSummary(implementatorId: string, startDate: string, endDate: string): Promise<any>;
    getImplementatorCommissionYearlySummary(implementatorId: string, year: number): Promise<any[]>;
    getSalesCommissionSummary(employeeId: string, startDate: string, endDate: string): Promise<any>;
    getSalesCommissionYearlySummary(employeeId: string, year: number): Promise<any[]>;
    deleteSnapshotByDateRangeAndType(startDate: string, endDate: string, serviceType: 'internal' | 'resell'): Promise<any>;
    insertSnapshot(data: SnapshotData): Promise<any>;
    getManagerTeamSummary(employees: { employeeId: string; name: string; photoProfile: string }[], startDate: string, endDate: string): Promise<any>;
    getManagerTeamYearlySummary(employees: { employeeId: string; name: string; photoProfile: string }[], year: number): Promise<any>;
    getManagerCommissionSummary(employeeIds: string[], startDate: string, endDate: string): Promise<any>;
    getManagerCommissionYearlySummary(employeeIds: string[], year: number): Promise<any[]>;
}
