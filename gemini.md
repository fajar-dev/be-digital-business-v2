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
  - `controller/` - Layer controller untuk menghandle request/response HTTP.
  - `service/` - Layer service untuk logic bisnis dan interaksi database.
  - `middleware/` - Custom middleware Hono (seperti `auth.middleware.ts`).
  - `helper/` - Utility classes seperti `ApiResponse` dan global `Exception`.
  - `job/` - Script-script standalone atau cron job (seperti `employee.job.ts`).
  - `route/` - Pemetaan routing Hono.
  - `index.ts` - Main entry point, server setup, dan Global Error Handler.
- `.env` - Environment variables (do not commit).
- `.env.example` - Template for environment variables.

## Coding Guidelines
1. **Clean Architecture & OOP**: 
   - Gunakan pendekatan *Clean Architecture* dengan memisahkan *Controller* dan *Service*.
   - Hindari penggunaan *static method* pada Controller dan Service. Gunakan *instance-based classes* yang diinisialisasi melalui `constructor()`.
2. **TypeScript First**: Selalu gunakan TypeScript. Hindari penggunaan tipe `any` sebisa mungkin dan definisikan `interface` atau `type` untuk data request, response, dan model database.
3. **Import System**: Gunakan ES Modules (`import/export`). Untuk `mysql2`, gunakan named import seperti `import { createPool } from 'mysql2/promise'`.
4. **Konfigurasi Tersentralisasi**: Semua nilai *environment* (dari `.env`) dikumpulkan dan di-export secara terstruktur melalui `src/config/app.ts`. Jangan panggil `process.env` langsung di controller/service.
5. **Database Naming Convention**: Pastikan penamaan *alias* kolom pada SQL Query menggunakan `snake_case`.
6. **Global Error Handling**: 
   - **JANGAN** menggunakan blok `try-catch` yang berlebihan di tingkat Controller atau Middleware hanya untuk me-*return* JSON statis.
   - Apabila terjadi kondisi error (misal data tidak ditemukan atau autentikasi gagal), lempar (*throw*) class exception yang sudah disiapkan di `src/helper/exception.ts` (misal: `throw new NotFoundException('Data tidak ada')`).
   - Semua *error* akan ditangkap dan diformat otomatis oleh *Global Error Handler* di `src/index.ts`.
7. **Standar API Response**: Semua *response* sukses maupun *error* (yang tidak tertangkap *exception*) harus diformat menggunakan fungsi statis dari `ApiResponse` (`src/helper/response.ts`). Contoh: `return ApiResponse.success(c, data, "Pesan sukses")`.

## Scripts
- **Development**: `bun run dev`
- **Employee Sync Job**: `bun run sync:employee`
- **Install Dependencies**: `bun add <package>` (Gunakan Bun, bukan npm)
