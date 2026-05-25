import { INisRepository, INisService } from "../interface/nis.interface";

export class NisService implements INisService {
    constructor(private readonly nisRepository: INisRepository) {}

    async getInternalByDateRange(startDate: string, endDate: string): Promise<any[]> {
        return await this.nisRepository.getInternalByDateRange(startDate, endDate);
    }
}