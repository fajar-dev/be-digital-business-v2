export interface INisRepository {
    getInternalByDateRange(startDate: string, endDate: string): Promise<any[]>;
    getChurnCountByImplementator(implementatorId: string, startDate: string, endDate: string): Promise<number>;
}

export interface INisService {
    getInternalByDateRange(startDate: string, endDate: string): Promise<any[]>;
    getChurnCountByImplementator(implementatorId: string, startDate: string, endDate: string): Promise<number>;
}
