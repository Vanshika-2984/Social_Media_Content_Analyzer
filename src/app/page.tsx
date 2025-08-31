"use client";

import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";

type Analysis = {
  extractedText: string;
  stats: any;
  suggestions: string[];
  platformTips: Record<string, string[]>;
  meta: { durationMs: number; ocr: boolean; parser: string };
};

export default function Page() {
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);
    form.append("platform", "generic");

    try {
      const res = await fetch("/api/ua", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Upload failed with ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid gap-6">
      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Upload your file</h2>
        <UploadDropzone onFileSelected={handleFile} disabled={loading} />
        <p className="text-sm text-slate-400 mt-2">Supported: PDF, PNG, JPG, JPEG</p>
      </section>

      {loading && (
        <section className="card">
          <p>Processing… this may take a moment for large files.</p>
        </section>
      )}

      {error && (
        <section className="card">
          <p className="text-red-400">Error: {error}</p>
        </section>
      )}

      {result && (
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analysis</h3>
            <span className="badge">took {Math.round(result.meta.durationMs)} ms</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 color:red">Extracted Text</h4>
              <pre className="text-slate-200">{result.extractedText || "(no text found)"}</pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Suggestions</h4>
              <ul className="list-disc pl-5 space-y-2">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
              <h4 className="font-semibold mt-6 mb-2">Stats</h4>
              <pre className="text-slate-200">{JSON.stringify(result.stats, null, 2)}</pre>
              <h4 className="font-semibold mt-6 mb-2">Platform Tips</h4>
              <pre className="text-slate-200">{JSON.stringify(result.platformTips, null, 2)}</pre>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
