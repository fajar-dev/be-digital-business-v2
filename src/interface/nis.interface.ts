export interface INisRepository {
    getInternalByDateRange(startDate: string, endDate: string): Promise<any[]>;
}

export interface INisService {
    getInternalByDateRange(startDate: string, endDate: string): Promise<any[]>;
}
