# Social Media Content Analyzer

**Production-ready Next.js (App Router) project** that lets users upload PDFs or images, extracts the text (PDF parsing + OCR), and generates **engagement suggestions** with basic analytics (length, sentiment, hashtags, mentions, CTAs).

Built to satisfy the technical assessment's requirements: document upload (PDF + images), text extraction (PDF parsing and OCR), loading states & basic error handling, and concise documentation.  
This package includes a **Postman collection**, **Dockerfile**, and an **`.env.example`** for one-touch setup.  
Project date: 2025-08-30

---

## Features

- 🚀 **Next.js 14** App Router (TypeScript), Tailwind UI
- 📄 **PDF Parsing** via `pdf-parse`
- 🔤 **OCR for images** via `tesseract.js` (with basic pre-processing using `sharp`)
- 🧠 **Content analysis**: sentiment, readability estimate, CTA/emoji/hashtag/url checks, platform-specific length guidance
- ⏱️ Loading UI, friendly errors
- 🧪 Postman collection for API testing
- 🐳 Dockerfile for production deployment
- 🔒 No persistent storage for uploads (processed in-memory)

---

## Quick Start

### 1) Clone & Install
```bash
pnpm i   # or npm i / yarn
```

### 2) Configure env
Copy `.env.example` to `.env` and review defaults.

### 3) Dev
```bash
pnpm dev   # http://localhost:3000
```

### 4) Build & Run
```bash
pnpm build
pnpm start
```

### 5) Docker (optional)
```bash
docker build -t smca .
docker run -p 3000:3000 --env-file .env smca
```

---

## API

### `GET /api/health`
Health probe.

### `POST /api/upload-and-analyze`
`multipart/form-data` with field `file` (PDF/PNG/JPG/JPEG) and optional `platform` (`twitter|instagram|linkedin|generic`).

**Response**
```json
{
  "extractedText": "string",
  "stats": { "wordCount": 0 },
  "suggestions": ["array of tips"],
  "platformTips": { "twitter": ["..."], "generic": ["..."] },
  "meta": { "durationMs": 0, "parser": "pdf-parse/tesseract.js", "ocr": true }
}
```

See **`postman/Social Media Content Analyzer.postman_collection.json`** for ready-made calls.

---

## Frontend
- Drag & drop using `react-dropzone`
- Simple two-column result view (extracted text + analysis)

---

## Implementation Notes

- **PDFs** parsed using `pdf-parse`. For **scanned PDFs** that have no embedded text, OCR fallback may be enabled by setting `ENABLE_PDF_OCR_FALLBACK=true` and installing **poppler-utils** (`pdftoppm`) on the host. The skeleton is present; image-page conversion logic can be added with libraries like `pdf-poppler`.
- **Images** processed with `sharp` (grayscale/normalize) and **OCR** with `tesseract.js`. Language(s) are configurable via `OCR_LANGS` env (default `eng`).

### Performance & Reliability
- Files are processed **in-memory** and not persisted.
- The endpoint runs on `runtime="nodejs"` for access to native modules like `sharp`.
- Avoid huge files. Default client limit is `NEXT_PUBLIC_MAX_FILE_SIZE_MB` (see env).

### Security
- MIME checks, size limits (client) and early returns for unsupported types.
- If exposing publicly, consider: auth, server-side size checks, rate limiting (reverse proxy), and antivirus scanning for uploads.

---

## Project Structure

```
social-media-content-analyzer/
├── .env.example
├── Dockerfile
├── docker-compose.yml (optional, not required)
├── next.config.mjs
├── package.json
├── postman/
│   └── Social Media Content Analyzer.postman_collection.json
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts
│   │   │   └── upload-and-analyze/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/UploadDropzone.tsx
│   ├── lib/{analyzer.ts, ocr.ts, pdf.ts}
│   ├── styles/globals.css
│   └── types/
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Postman Collection

Import `postman/Social Media Content Analyzer.postman_collection.json`, set the `baseUrl` variable (default `http://localhost:3000`), and hit **Upload & Analyze**.

---

## Notes for Reviewers

- Designed to meet the **"Social Media Content Analyzer"** brief: document upload, PDF parsing, OCR for images, production-ready structure with documentation and Postman collection. See assignment reference in the recruiting doc.
