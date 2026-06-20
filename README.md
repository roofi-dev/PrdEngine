# PrdEngine AI

PrdEngine adalah aplikasi berbasis AI yang dirancang untuk membantu Product Manager dan Developer dalam membuat **Product Requirement Document (PRD)** secara otomatis dan profesional.

## 🚀 Tech Stack

Aplikasi ini dibangun menggunakan teknologi modern:

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **AI Engine**: [Google Genkit AI](https://firebase.google.com/docs/genkit) dengan model Google Gemini
- **Backend & Hosting**: [Firebase](https://firebase.google.com/) (App Hosting)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) untuk validasi schema
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)

## ✨ Fungsi Utama

1. **AI PRD Generation**: Membuat draf PRD lengkap (latar belakang, fitur, user stories, technical specs) hanya dari konsep singkat.
2. **Multi-bahasa**: Mendukung pembuatan dokumen dalam bahasa **Indonesia** dan **Inggris**.
3. **Interactive PRD Editor**: Memungkinkan pengguna untuk mengedit dan menyempurnakan draf yang dihasilkan AI secara langsung.
4. **AI Revision**: Fitur untuk merevisi bagian tertentu dari PRD menggunakan instruksi AI tambahan.
5. **Modern Dashboard**: Antarmuka pengguna yang bersih, responsif, dan mudah digunakan.

## 🛠️ Cara Memulai

1. **Install dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan mode pengembangan**:
   ```bash
   npm run dev
   ```

3. **Jalankan Genkit UI (untuk debugging AI flow)**:
   ```bash
   npm run genkit:dev
   ```

---
Dibuat dengan ❤️ menggunakan Firebase Studio.
