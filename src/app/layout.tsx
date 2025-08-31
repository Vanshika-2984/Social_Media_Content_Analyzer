import "./../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Media Content Analyzer",
  description: "Analyze posts from PDFs or images and get engagement suggestions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-8">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">📈 Social Media Content Analyzer</h1>
            <p className="text-slate-300 mt-2">Upload PDFs or images to extract text and get actionable suggestions to improve engagement.</p>
          </header>
          {children}
          <footer className="mt-12 text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} Social Media Content Analyzer</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
