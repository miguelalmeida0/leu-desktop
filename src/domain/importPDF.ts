import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { Document } from "./model";
GlobalWorkerOptions.workerSrc = worker;
export async function readLocalPDF(file: File): Promise<Document> {
  if (file.size > 2 * 1024 * 1024)
    throw new Error("This file exceeds 2 MB. Choose a smaller PDF.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
    throw new Error("This is not a valid PDF file.");
  const task = getDocument({
    data: bytes,
    useSystemFonts: true,
    disableFontFace: true,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          "This PDF took too long to read. Try a simpler or smaller file.",
        ),
      );
      void task.destroy();
    }, 15000);
  });
  try {
    return await Promise.race([
      timeout,
      (async () => {
        const pdf = await task.promise;
        if (pdf.numPages > 40)
          throw new Error("This demo accepts up to 40 pages per PDF.");
        const pages = [];
        let total = 0;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items
            .map((item) =>
              "str" in item
                ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
                : "",
            )
            .join("")
            .trim();
          if (text.length > 30000)
            throw new Error(
              "A page contains too much text for this local demo.",
            );
          total += text.length;
          if (total > 120000)
            throw new Error(
              "This PDF contains too much text for this local demo.",
            );
          pages.push({
            heading: `Page ${i}`,
            text: text || "No extractable text on this page.",
          });
        }
        if (!total)
          throw new Error(
            "No readable text found. Choose a text-based PDF rather than a scan.",
          );
        return {
          id: crypto.randomUUID(),
          title:
            file.name.replace(/\.pdf$/i, "").slice(0, 200) || "Untitled PDF",
          category: "Imported",
          cover: "slate",
          kind: "PDF" as const,
          pages,
        };
      })(),
    ]);
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException")
      throw new Error(
        "This PDF is password protected. Choose an unlocked copy.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
    await task.destroy();
  }
}
