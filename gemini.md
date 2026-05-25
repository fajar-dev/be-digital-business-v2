# Project Context & AI Guidelines

This document provides context and guidelines for AI coding assistants (like Gemini) working on this project.

## Project Details
- **Project Name**: Digital Bisnis Backend v2 (`be-v2`)
- **Runtime**: Bun
- **Framework**: Hono
- **Language**: TypeScript
- **Database**: MySQL (using `mysql2/promise`)

## Project Structure
- `src/` - Main source code directory.
  - `config/` - Configuration files (app config tersentralisasi & database connection pools).
  - `interface/` - Definisi kontrak (interfaces) untuk Service dan Repository (misal: `IEmployeeService`, `IAuthService`).
  - `repository/` - Layer repository murni untuk akses database (SQL queries) atau koneksi data langsung.
  - `service/` - Layer service untuk logic bisnis, perhitungan komisi, dan penyusunan data (tanpa raw SQL).
  - `controller/` - Layer controller untuk menghandle request/response HTTP (sangat tipis).
  - `middleware/` - Custom middleware Hono (seperti `auth.middleware.ts`).
  - `helper/` - Utility classes seperti `ApiResponse`, perhitungan komisi, dan global `Exception`.
  - `job/` - Script-script standalone atau cron job (seperti `employee.job.ts`).
  - `route/` - Pemetaan routing Hono dan tempat dilakukannya **Manual Dependency Injection**.
  - `index.ts` - Main entry point, server setup, dan Global Error Handler.
- `.env` - Environment variables (do not commit).
- `.env.example` - Template for environment variables.

## Coding Guidelines
1. **Full Clean Architecture & DI**: 
   - Gunakan pendekatan *Clean Architecture* dengan memisahkan *Controller*, *Service*, dan *Repository*.
   - **WAJIB** membuat antarmuka (*Interface*) di dalam folder `src/interface/` untuk setiap Service dan Repository.
   - Hindari *static method* pada Controller dan Service. Gunakan *Dependency Injection* murni melalui `constructor()` (misal: `constructor(private readonly employeeService: IEmployeeService)`).
   - Pengkabelan (instansiasi class berjenjang) dilakukan terpusat di `src/route/api.ts` atau *entry file* (seperti *job file*).
2. **TypeScript First**: Selalu gunakan TypeScript. Hindari penggunaan tipe `any` sebisa mungkin dan definisikan `interface` atau `type` untuk data request, response, dan model database.
3. **Import System**: Gunakan ES Modules (`import/export`). Untuk `mysql2`, gunakan named import.
4. **Konfigurasi Tersentralisasi**: Semua nilai *environment* (dari `.env`) dikumpulkan dan di-export secara terstruktur melalui `src/config/app.ts`. Jangan panggil `process.env` langsung di tempat lain.
5. **Database Naming Convention**: Pastikan penamaan *alias* kolom pada SQL Query menggunakan `snake_case`.
6. **Global Error Handling**: 
   - **JANGAN** menggunakan blok `try-catch` berlebihan di tingkat Controller hanya untuk me-*return* JSON statis.
   - Lempar exception: `throw new NotFoundException('Data tidak ada')` atau `UnauthorizedException`.
7. **Standar API Response**: Semua *response* sukses/error harus diformat menggunakan fungsi dari `ApiResponse` (`src/helper/response.ts`). Contoh: `return ApiResponse.success(c, data, "Pesan sukses")`.

## Business Rules: Commission (Komisi)
Berikut adalah ketetapan logika bisnis (dari `CommissionCalculator`) yang tidak boleh diubah tanpa persetujuan:

1. **Komisi Internal (Sales)**:
   - **Upgrade**: 20%
   - **New / Termin (Cross-Sell > 0)**: 15%
   - **New / Termin (No Cross-Sell)**: 12%
   - **Recurring**: 1%
   - *Special Rule*: Jika `New` dibayar dimuka `> 12 bulan`, komisi penuh diberikan untuk proporsi 12 bulan pertama, dan 1% recurring untuk sisa bulannya.

2. **Komisi Resell (Sales)**:
   - **Recurring**: 0.5%
   - **New / Upgrade (Margin >= 15%)**: 5%
   - **New / Upgrade (Margin >= 10%)**: 4%
   - **New / Upgrade (Margin < 10%)**: 2.5%

3. **Komisi Implementator**:
   - Dihitung secara **Prorata** untuk status `new` atau `upgrade` (dibagi `monthPeriod`).
   - **Recurring**: 1% (Tipe: `recurring`)
   - **Ada Churn (churnCount > 0)**: 17.5% (Tipe: `base`)
   - **Tidak ada Churn**: 20% (Tipe: `retention`)

## Scripts
- **Development**: `bun run dev`
- **Employee Sync Job**: `bun run sync:employee`
- **Internal Invoice Sync Job**: `bun run sync:internal-invoice`
- **Install Dependencies**: `bun add <package>` (Gunakan Bun, bukan npm)
