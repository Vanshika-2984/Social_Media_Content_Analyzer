import Tesseract from "tesseract.js";
import sharp from "sharp";

function detectLangs() {
  const env = process.env.OCR_LANGS || "eng";
  return env.split(",").map(s => s.trim()).filter(Boolean).join("+");
}


async function preprocessImage(input: Buffer) {
  try {
    const img = sharp(input).grayscale().normalise();
    return await img.toBuffer();
  } catch (e) {
    return input;
  }
}

export async function ocrImageBuffer(buf: Buffer, mime?: string): Promise<string> {
  const prepped = await preprocessImage(buf);
  const langs = detectLangs();

  const worker = await Tesseract.createWorker(langs, 1, {
    logger: (m) => process.env.NODE_ENV === "development" && console.log(m),
  });
  try {
    const { data } = await worker.recognize(prepped);
    return data.text || "";
  } finally {
    await worker.terminate();
  }
}
