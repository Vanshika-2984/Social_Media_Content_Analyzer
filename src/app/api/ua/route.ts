import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; 
export const maxDuration = 300; 

const bodySchema = z.object({
  platform: z.string().optional(),
});

function isImage(mime: string | undefined) {
  return !!mime && mime.startsWith("image/");
}


export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Upload-and-analyze endpoint is alive. Use POST with multipart/form-data: fields `file` + optional `platform`.",
  });
}

export async function POST(req: Request) {
  const start = Date.now();

  try {
    const [{ analyzeText }, { parsePdfBuffer }, { ocrImageBuffer }] = await Promise.all([
      import("@/lib/analyzer"),
      import("@/lib/pdf"),
      import("@/lib/ocr"),
    ]);

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const platform = (form.get("platform") as string | null) || "generic";
    bodySchema.parse({ platform });

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const mime = file.type;
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    let extractedText = "";
    let parser = "unknown";
    let usedOcr = false;

    if (mime === "application/pdf") {
      parser = "pdf-parse";
      extractedText = await parsePdfBuffer(buf);

      const enablePdfOcr =
        (process.env.ENABLE_PDF_OCR_FALLBACK || "false").toLowerCase() === "true";
      if (enablePdfOcr && (!extractedText || extractedText.trim().length < 5)) {
        usedOcr = true;
        parser = "pdf-parse + OCR fallback";
       
      }
    } else if (isImage(mime)) {
      parser = "tesseract.js";
      extractedText = await ocrImageBuffer(buf, mime);
      usedOcr = true;
    } else {
      return NextResponse.json({ error: `Unsupported mime type: ${mime}` }, { status: 415 });
    }

    const { stats, suggestions, platformTips } = analyzeText(extractedText || "", platform);

    return NextResponse.json({
      extractedText,
      stats,
      suggestions,
      platformTips,
      meta: { durationMs: Date.now() - start, parser, ocr: usedOcr },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
