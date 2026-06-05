import { INisRepository, INisService } from "../interface/nis.interface";

export class NisService implements INisService {
    constructor(private readonly nisRepository: INisRepository) {}

    async getInternalByDateRange(startDate: string, endDate: string): Promise<any[]> {
        return await this.nisRepository.getInternalByDateRange(startDate, endDate);
    }

    async getResellByDateRange(startDate: string, endDate: string): Promise<any[]> {
        return await this.nisRepository.getResellByDateRange(startDate, endDate);
    }

    async getChurnCountByImplementator(implementatorId: string, startDate: string, endDate: string): Promise<number> {
        return this.nisRepository.getChurnCountByImplementator(implementatorId, startDate, endDate);
    }
}