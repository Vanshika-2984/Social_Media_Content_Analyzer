export async function parsePdfBuffer(buf: Buffer): Promise<string> {
  const { default: PDFParser } = await import("pdf2json");

  return await new Promise((resolve, reject) => {
    try {
      const parser = new PDFParser(null, true); 
      parser.on("pdfParser_dataError", (err: any) => {
        reject(new Error(err?.parserError || "PDF parse error"));
      });
      parser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const pages = pdfData?.Pages || [];
          const text = pages
            .map((page: any) =>
              (page.Texts || [])
                .map((t: any) =>
                  (t.R || [])
                    .map((r: any) => {
                      try {
                        return decodeURIComponent(r.T || "");
                      } catch {
                        return r.T || "";
                      }
                    })
                    .join("")
                )
                .join(" ")
            )
            .join("\n");
          resolve(text.trim());
        } catch {
          resolve("");
        }
      });
      parser.parseBuffer(buf);
    } catch (e: any) {
      reject(e);
    }
  });
}
