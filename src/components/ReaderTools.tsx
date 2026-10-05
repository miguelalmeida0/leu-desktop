import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Send } from "lucide-react";
import type { Document } from "../domain/model";
import { useStore } from "../domain/store";
import { learningFor } from "../domain/intelligence";
import { SourceLink } from "./ui";
export default function ReaderTools({
  doc,
  page,
}: {
  doc: Document;
  page: number;
}) {
  const { state, update } = useStore();
  const id = doc.id;
  const source = { documentId: id, page };
  const learning = learningFor(doc, page);
  const study = (mode: string) => `/study?doc=${id}&page=${page}&mode=${mode}`;
  const [tab, setTab] = useState("Ask Leu");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);
  useEffect(() => {
    setAsked(false);
    setSaved("");
  }, [id, page]);
  return (
    <aside className="intelligence-panel" aria-label="Contextual tools">
      <div className="tabs" role="tablist" aria-label="Reader tools">
        {["Ask Leu", "Notes", "Source"].map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t.replace(" ", "")}`}
            aria-selected={t === tab}
            aria-controls="reader-panel"
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        id="reader-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab.replace(" ", "")}`}
        className="panel-content"
      >
        {tab === "Ask Leu" ? (
          <>
            <div className="explain-card">
              <span className="leu-orb">L</span>
              <h2>Explain like I’m 10</h2>
              <p>
                A clearer way into this idea.
                <br />
                Grounded in the page you’re reading.
              </p>
              <Link className="button" to={study("explain")}>
                Explain this page <ArrowUpRight size={16} />
              </Link>
            </div>
            <Link className="suggestion" to={study("quiz")}>
              Ask Me <ChevronRight size={16} />
            </Link>
            <Link className="suggestion" to={study("teach")}>
              Teach Leu <ChevronRight size={16} />
            </Link>
            <Link className="suggestion" to={study("apply")}>
              How can I apply this? <ChevronRight size={16} />
            </Link>
            {asked && (
              <div className="answer" role="status">
                <small>Prepared explanation · this page</small>
                <p>{learning.explanation}</p>
                <SourceLink source={source} />
              </div>
            )}
            <form
              className="ask-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (question.trim()) setAsked(true);
              }}
            >
              <label className="sr-only" htmlFor="ask">
                Ask about this page
              </label>
              <input
                id="ask"
                placeholder="Ask about this page…"
                value={question}
                maxLength={500}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                aria-label="Show source explanation"
                className="send"
                disabled={!question.trim()}
              >
                <Send size={17} />
              </button>
            </form>
          </>
        ) : tab === "Notes" ? (
          <>
            <h2>Your margin notes</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  note.trim() &&
                  update((s) => ({
                    ...s,
                    notes: [
                      ...s.notes,
                      {
                        id: crypto.randomUUID(),
                        ...source,
                        text: note.trim(),
                        created: Date.now(),
                      },
                    ],
                  }))
                ) {
                  setNote("");
                  setSaved("Note saved.");
                }
              }}
            >
              <label htmlFor="reader-note">
                Add a note for page {page + 1}
              </label>
              <textarea
                id="reader-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={4000}
                rows={5}
              />
              <button className="button primary" disabled={!note.trim()}>
                Save note
              </button>
              <p role="status">{saved}</p>
            </form>
            {state.notes
              .filter((n) => n.documentId === id && n.page === page)
              .map((n) => (
                <p className="margin-note" key={n.id}>
                  {n.text}
                </p>
              ))}
            <Link className="text-link" to="/notes">
              Edit all notes <ArrowUpRight size={14} />
            </Link>
          </>
        ) : (
          <>
            <h2>Return to the evidence</h2>
            <p>
              {doc.title} · Page {page + 1}
            </p>
            <blockquote>{learning.quote}</blockquote>
            <SourceLink source={source} />
            {doc.file && (
              <a
                className="button"
                href={doc.file}
                target="_blank"
                rel="noreferrer"
              >
                Open original PDF <ArrowUpRight size={16} />
              </a>
            )}
            <p className="fine-print">
              {doc.file
                ? "This text comes from the original bundled sample PDF."
                : "Text extracted locally from your PDF. The original file was not uploaded."}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
