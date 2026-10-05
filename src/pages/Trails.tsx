import { useRef, useState, type PointerEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  Minus,
  Maximize,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Network,
} from "lucide-react";
import { concepts, learningFor } from "../domain/intelligence";
import { useStore } from "../domain/store";
import { Modal, PageHeading, SourceLink } from "../components/ui";
export default function Trails() {
  const { state, allDocuments, update } = useStore();
  const explore = useLocation().pathname === "/explore";
  const [selected, setSelected] = useState("Thinking");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [trailId, setTrailId] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const concept = concepts.find((c) => c.id === selected) ?? concepts[0];
  const trail = state.trails.find((t) => t.id === trailId);
  const sources = trail?.sources ?? concept.sources;
  function start(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (d)
      setPan({ x: d.px + event.clientX - d.x, y: d.py + event.clientY - d.y });
  }
  return (
    <div className="page trails-page">
      <PageHeading
        title={explore ? "Explore" : "Connections"}
        subtitle="See the bigger picture. Explore how ideas link together."
      >
        <button
          className="button primary"
          onClick={() => {
            setTitle(`${selected} trail`);
            setOpen(true);
          }}
        >
          <Plus size={18} />
          Create trail
        </button>
      </PageHeading>
      <div className="connections-toolbar">
        <div className="chips" aria-label="Saved trails">
          <button
            className={`chip ${!trailId ? "selected" : ""}`}
            onClick={() => setTrailId(null)}
          >
            All connections
          </button>
          {state.trails.map((t) => (
            <button
              key={t.id}
              aria-pressed={trailId === t.id}
              className={`chip ${trailId === t.id ? "selected" : ""}`}
              onClick={() => {
                setTrailId(t.id);
                setSelected(t.concept);
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
        <label className="search compact">
          <Search size={17} />
          <input
            placeholder="Search concepts…"
            aria-label="Search concepts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="connections-layout">
        <div
          className="graph"
          aria-label="Concept graph"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <div
            className="graph-world"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <svg
              className="graph-lines"
              viewBox="0 0 700 560"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {concepts.slice(1).map((c) => (
                <line key={c.id} x1="350" y1="280" x2={c.x} y2={c.y} />
              ))}
              <path d="M155 255 L215 450 L450 450 L555 255 L350 100 Z" />
            </svg>
            {concepts.map((c, i) => (
              <button
                key={c.id}
                className={`graph-node node-${i} ${c.id === selected ? "is-selected" : ""} ${query && !c.id.toLowerCase().includes(query.toLowerCase()) ? "dimmed" : ""}`}
                aria-pressed={c.id === selected}
                style={{ left: `${c.x / 7}%`, top: `${c.y / 5.6}%` }}
                onClick={() => {
                  setSelected(c.id);
                  setTrailId(null);
                }}
              >
                {i === 0 && <Network size={20} />}
                <span>{c.id === "Thinking" ? "Better thinking" : c.id}</span>
              </button>
            ))}
          </div>
          <div className="graph-controls" aria-label="Graph navigation">
            <button
              aria-label="Zoom out"
              className="icon-button"
              disabled={zoom <= 0.6}
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            >
              <Minus size={16} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              aria-label="Zoom in"
              className="icon-button"
              disabled={zoom >= 1.6}
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            >
              <Plus size={16} />
            </button>
            <button
              aria-label="Reset graph view"
              className="icon-button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <Maximize size={16} />
            </button>
            {[
              [ArrowLeft, -50, 0, "left"],
              [ArrowRight, 50, 0, "right"],
              [ArrowUp, 0, -50, "up"],
              [ArrowDown, 0, 50, "down"],
            ].map(([Icon, x, y, label]) => {
              const I = Icon as typeof ArrowLeft;
              return (
                <button
                  key={String(label)}
                  aria-label={`Pan ${label}`}
                  className="icon-button"
                  onClick={() =>
                    setPan((p) => ({ x: p.x + Number(x), y: p.y + Number(y) }))
                  }
                >
                  <I size={15} />
                </button>
              );
            })}
          </div>
          <p className="graph-hint">
            Select an idea · Drag to explore · Use controls to zoom
          </p>
          {query &&
            !concepts.some((c) =>
              c.id.toLowerCase().includes(query.toLowerCase()),
            ) && (
              <p className="graph-no-match" role="status">
                No matching concepts. Try “State” or “Identity”.
              </p>
            )}
        </div>
        <aside className="related-panel">
          <header>
            <span className="small-label">
              {trail ? "SAVED TRAIL" : "SELECTED CONCEPT"}
            </span>
            <h2>{trail?.title ?? selected}</h2>
            <p>{sources.length} connected source passages</p>
          </header>
          <h3>Related content</h3>
          {sources.map((source) => {
            const doc = allDocuments.find((d) => d.id === source.documentId);
            if (!doc) return null;
            return (
              <article
                className="related-item"
                key={`${doc.id}:${source.page}`}
              >
                <h4>{doc.pages[source.page].heading}</h4>
                <p>
                  {doc.title} · Page {source.page + 1}
                </p>
                <blockquote>“{learningFor(doc, source.page).quote}”</blockquote>
                <SourceLink source={source} label="Read passage" />
              </article>
            );
          })}
          <Link className="text-link" to="/library">
            Find more in your library <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
      <p role="status" className="saved-notice">
        {notice}
      </p>
      {open && (
        <Modal title="Create a knowledge trail" onClose={() => setOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const id = crypto.randomUUID();
              if (
                title.trim() &&
                update((s) => ({
                  ...s,
                  trails: [
                    ...s.trails,
                    {
                      id,
                      title: title.trim(),
                      concept: selected,
                      sources: concept.sources,
                    },
                  ],
                }))
              ) {
                setTrailId(id);
                setNotice(`Trail “${title.trim()}” saved.`);
                setOpen(false);
              }
            }}
          >
            <p>
              Keep the {concept.sources.length} source passages connected to{" "}
              {selected.toLowerCase()} together.
            </p>
            <label htmlFor="trail-title">Trail name</label>
            <input
              id="trail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              autoFocus
            />
            <button className="button primary" disabled={!title.trim()}>
              Save trail
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
