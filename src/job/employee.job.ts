import { NusaworkService } from '../service/nusawork.service';
import { EmployeeService } from '../service/employee.service';

const nusaworkService = new NusaworkService();
const employeeService = new EmployeeService();

async function syncEmployees() {
    console.log('[SYNC] Starting employee synchronization from Nusawork...');
    
    try {
        console.log('[SYNC] Fetching Sales Digital employees...');
        const salesEmployees = await nusaworkService.getSalesDigital();
        console.log(`[SYNC] Found ${salesEmployees.length} Sales Digital employees.`);

        console.log('[SYNC] Fetching Admin employees...');
        const adminEmployees = await nusaworkService.getEmployeeAdmin();
        console.log(`[SYNC] Found ${adminEmployees.length} Admin employees.`);

        // Combine both lists
        const allEmployees = [...salesEmployees, ...adminEmployees];
        
        // Remove duplicates if any (based on employeeId)
        const uniqueEmployeesMap = new Map();
        for (const emp of allEmployees) {
            uniqueEmployeesMap.set(emp.employeeId, emp);
        }
        const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

        console.log(`[SYNC] Total unique employees to sync: ${uniqueEmployees.length}`);

        let successCount = 0;
        let errorCount = 0;

        for (const emp of uniqueEmployees) {
            try {
                await employeeService.insertEmployee(emp);
                successCount++;
            } catch (err: any) {
                console.error(`[SYNC ERROR] Failed to insert employee ${emp.name} (${emp.employeeId}): ${err.message}`);
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

syncEmployees();
