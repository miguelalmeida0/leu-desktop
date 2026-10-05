import ReaderTools from "../components/ReaderTools";
import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  BookOpen,
} from "lucide-react";
import { useStore } from "../domain/store";
import { Empty } from "../components/ui";

export default function Reader() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, allDocuments, update } = useStore();
  const doc = allDocuments.find((d) => d.id === id);
  const rawPage = Number(params.get("page") ?? state.progress[id ?? ""] ?? 0);
  const page = doc
    ? Math.min(
        doc.pages.length - 1,
        Math.max(0, Number.isFinite(rawPage) ? Math.floor(rawPage) : 0),
      )
    : 0;
  useEffect(() => {
    if (doc)
      update((s) => ({
        ...s,
        progress: { ...s.progress, [doc.id]: page },
        recent: [doc.id, ...s.recent.filter((i) => i !== doc.id)].slice(0, 30),
      }));
  }, [id, page]);
  function go(next: number) {
    setParams({ page: String(next) });
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.target as HTMLElement).closest("input,textarea,select,button,a")
      )
        return;
      if (event.key === "ArrowRight" && doc && page < doc.pages.length - 1) {
        event.preventDefault();
        go(page + 1);
      }
      if (event.key === "ArrowLeft" && page > 0) {
        event.preventDefault();
        go(page - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, doc]);
  if (!doc)
    return (
      <Empty title="Document not found">
        <Link to="/library">Return to Library</Link>
      </Empty>
    );
  const source = { documentId: doc.id, page };
  const section = doc.pages[page];
  const highlighted = state.highlights.some(
    (h) => h.documentId === id && h.page === page,
  );
  return (
    <>
      <header className="reader-toolbar">
        <Link
          className="icon-button"
          to="/library"
          aria-label="Back to Library"
        >
          <ArrowLeft size={19} />
        </Link>
        <strong>{doc.title}</strong>
        <span className="muted">PDF · {doc.pages.length} pages</span>
        <div className="toolbar-end">
          <button
            className={`button ${highlighted ? "highlight-active" : ""}`}
            onClick={() =>
              update((s) => ({
                ...s,
                highlights: highlighted
                  ? s.highlights.filter(
                      (h) => h.documentId !== id || h.page !== page,
                    )
                  : [...s.highlights, source],
              }))
            }
            aria-pressed={highlighted}
          >
            <Highlighter size={16} />
            Highlight source
          </button>
        </div>
      </header>
      <div className="reader-layout">
        <aside className="outline" aria-label="Document contents">
          <h2>Contents</h2>
          {doc.pages.map((p, i) => (
            <button
              key={i}
              aria-current={i === page ? "page" : undefined}
              onClick={() => go(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {p.heading}
            </button>
          ))}
          <div className="outline-bottom">
            <BookOpen size={17} />
            <p>
              {doc.category === "Imported"
                ? "Your local document"
                : "Original sample notes"}
              <br />
              <span>{doc.pages.length} pages · Read at your pace</span>
            </p>
          </div>
        </aside>
        <div className="paper-wrap">
          <article
            className="paper"
            aria-label={`${doc.title}, page ${page + 1}`}
          >
            <div className="paper-meta">
              {doc.title} <span>PAGE {String(page + 1).padStart(2, "0")}</span>
            </div>
            {params.get("source") && (
              <div className="source-return" role="status">
                Exact source · {doc.title} · Page {page + 1}
              </div>
            )}
            <h1 tabIndex={-1}>{section.heading}</h1>
            <div className="source-text">
              {section.text.split(/\n\s*\n/).map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0 && (highlighted || params.get("source"))
                      ? "passage highlighted"
                      : "passage"
                  }
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="paper-footer">
              LEU /{" "}
              {doc.category === "Imported"
                ? "LOCAL DOCUMENT"
                : "ORIGINAL SAMPLE NOTES"}
              <span>{page + 1}</span>
            </div>
          </article>
          <nav className="page-controls" aria-label="Reading pages">
            <button
              className="icon-button"
              aria-label="Previous page"
              onClick={() => go(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {page + 1} / {doc.pages.length}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              onClick={() => go(page + 1)}
              disabled={page === doc.pages.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        </div>
        <ReaderTools doc={doc} page={page} />
      </div>
    </>
  );
}
