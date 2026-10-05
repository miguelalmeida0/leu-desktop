import { useRef, useState } from "react";
import { Plus, FileText } from "lucide-react";
import { useStore } from "../domain/store";
import { Modal } from "./ui";
export default function ImportButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const { update } = useStore();
  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("Reading PDF on your device…");
    try {
      const { readLocalPDF } = await import("../domain/importPDF");
      const document = await readLocalPDF(file);
      if (update((s) => ({ ...s, imported: [document, ...s.imported] })))
        setMessage(
          `Imported ${document.title}. Its text is saved only in this browser.`,
        );
      else
        setMessage(
          "Import was not saved. Check the storage message and try again.",
        );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "This PDF could not be read.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <button
        className="button primary"
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
      >
        <Plus size={18} />
        Import PDFs
      </button>
      {open && (
        <Modal title="Add to your library" onClose={() => setOpen(false)}>
          <div className="import-zone">
            <FileText size={34} />
            <h3>Your documents stay yours.</h3>
            <p>
              Choose a text-based PDF, up to 2 MB and 40 pages. Text is
              extracted locally and saved in this browser. No file is uploaded.
              Scanned pages need OCR before import.
            </p>
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              aria-label="Choose a local PDF"
              disabled={busy}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <p role="status">{message}</p>
          </div>
        </Modal>
      )}
    </>
  );
}
