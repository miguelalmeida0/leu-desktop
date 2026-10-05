import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight } from "lucide-react";
import { useStore } from "../domain/store";
import { progressPercent } from "../domain/model";
import {
  Cover,
  Empty,
  PageHeading,
  Progress,
  SectionHeading,
} from "../components/ui";
import ImportButton from "../components/ImportButton";
export default function Library() {
  const { state, allDocuments } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const docs = allDocuments
    .filter(
      (d) =>
        (filter === "All" || d.category === filter) &&
        `${d.title} ${d.pages.map((p) => p.text).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "progress"
          ? progressPercent(state, b) - progressPercent(state, a)
          : 0,
    );
  const recent = state.recent
    .map((id) => allDocuments.find((d) => d.id === id))
    .filter((d) => !!d)
    .slice(0, 3);
  return (
    <div className="page">
      <PageHeading
        title="Library"
        subtitle="Your PDFs and knowledge — all in one place."
      >
        <ImportButton />
      </PageHeading>
      <label className="search">
        <Search size={20} />
        <input
          aria-label="Search books, PDFs, or passages"
          placeholder="Search books, PDFs, or passages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="library-toolbar">
        <div className="chips" aria-label="Filter library">
          {["All", "Frontend", "Backend", "Study", "Imported"].map((f) => (
            <button
              key={f}
              className={f === filter ? "chip selected" : "chip"}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="sort">
          Sort:{" "}
          <select
            aria-label="Sort documents"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Recently added</option>
            <option value="title">Title</option>
            <option value="progress">Reading progress</option>
          </select>
        </label>
      </div>
      {docs.length ? (
        <div className="document-grid">
          {docs.map((doc) => (
            <Link
              className="document-card"
              key={doc.id}
              to={`/reader/${doc.id}`}
              aria-label={`Open ${doc.title}`}
            >
              <Cover document={doc} />
              <h2>{doc.title}</h2>
              <p>Leu · {doc.category}</p>
              <p className="document-meta">PDF · {doc.pages.length} pages</p>
              <Progress value={progressPercent(state, doc)} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="No documents found">
          Try another search or import a PDF to start this collection.
        </Empty>
      )}
      <section className="recent-section">
        <SectionHeading title="Recently opened" />
        <div className="recent-grid">
          {recent.map((doc) => (
            <Link to={`/reader/${doc.id}`} className="recent-item" key={doc.id}>
              <Cover document={doc} small />
              <div>
                <h3>{doc.title}</h3>
                <p>
                  Page {(state.progress[doc.id] ?? 0) + 1} · Original sample
                </p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
