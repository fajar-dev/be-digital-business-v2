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
  - `config/` - Configuration files (e.g., database connections).
  - `index.ts` - Main entry point and server setup.
- `.env` - Environment variables (do not commit).
- `.env.example` - Template for environment variables.

## Coding Guidelines
1. **TypeScript First**: Selalu gunakan TypeScript. Hindari penggunaan tipe `any` sebisa mungkin dan definisikan `interface` atau `type` untuk data request, response, dan model database.
2. **Import System**: Gunakan ES Modules (`import/export`). Catatan khusus untuk library seperti `mysql2`: gunakan named import seperti `import { createPool } from 'mysql2/promise'` karena modul tersebut tidak memiliki default export.
3. **Konfigurasi Database**: Gunakan *connection pool* untuk efisiensi koneksi ke MySQL. Konfigurasi kredensial harus selalu mengambil dari `process.env`.
4. **Error Handling**: Tangkap error (try-catch) pada operasi *asynchronous* dan selalu kembalikan status HTTP yang sesuai (misal: 400 untuk bad request, 500 untuk internal server error).
5. **Struktur Route**: Jaga agar `src/index.ts` tetap bersih. Jika aplikasi berkembang, pisahkan route ke dalam file/folder terpisah (seperti `src/routes/` atau `src/controllers/`).

## Scripts
- **Development**: `bun run dev`
- **Install Dependencies**: `bun install`
