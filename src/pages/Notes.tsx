import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../domain/store";
import type { Note } from "../domain/model";
import { Empty, Modal, PageHeading, SourceLink } from "../components/ui";
export default function Notes() {
  const { state, allDocuments, update } = useStore();
  const [editing, setEditing] = useState<Note | null>(null);
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<Note | null>(null);
  return (
    <div className="page">
      <PageHeading
        title="Notes"
        subtitle="Keep what matters. Every thought has a source."
      >
        <button
          className="button primary"
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              text: "",
              documentId: "react",
              page: 0,
              created: Date.now(),
            })
          }
        >
          <Plus size={18} />
          New note
        </button>
      </PageHeading>
      <div className="notes-list">
        {state.notes.map((note) => (
          <article className="note-card" key={note.id}>
            <p>{note.text}</p>
            <footer>
              <SourceLink source={note} />
              <button
                className="icon-button"
                aria-label={`Edit note: ${note.text.slice(0, 30)}`}
                onClick={() => setEditing(note)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button"
                aria-label={`Delete note: ${note.text.slice(0, 30)}`}
                onClick={() => setDeleting(note)}
              >
                <Trash2 size={16} />
              </button>
            </footer>
          </article>
        ))}
      </div>
      {!state.notes.length && (
        <Empty title="A fresh page">
          Add a note here or save an insight from your reader.
        </Empty>
      )}
      <p role="status">{notice}</p>
      {editing && (
        <Modal title="Your note" onClose={() => setEditing(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                editing.text.trim() &&
                update((s) => ({
                  ...s,
                  notes: [
                    ...s.notes.filter((n) => n.id !== editing.id),
                    { ...editing, text: editing.text.trim() },
                  ],
                }))
              ) {
                setEditing(null);
                setNotice("Note saved.");
              }
            }}
          >
            <label htmlFor="note-document">Source document</label>
            <select
              id="note-document"
              value={editing.documentId}
              onChange={(e) =>
                setEditing({ ...editing, documentId: e.target.value, page: 0 })
              }
            >
              {allDocuments.map((d) => (
                <option value={d.id} key={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <label htmlFor="note-page">Source page</label>
            <select
              id="note-page"
              value={editing.page}
              onChange={(e) =>
                setEditing({ ...editing, page: Number(e.target.value) })
              }
            >
              {allDocuments
                .find((d) => d.id === editing.documentId)
                ?.pages.map((p, i) => (
                  <option key={i} value={i}>
                    Page {i + 1} — {p.heading}
                  </option>
                ))}
            </select>
            <label htmlFor="note-text">Note</label>
            <textarea
              id="note-text"
              autoFocus
              value={editing.text}
              rows={6}
              maxLength={4000}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
            />
            <button className="button primary" disabled={!editing.text.trim()}>
              Save note
            </button>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete this note?" onClose={() => setDeleting(null)}>
          <p>
            This removes your note from this browser. The source document is
            preserved.
          </p>
          <div className="dialog-actions">
            <button className="button" onClick={() => setDeleting(null)}>
              Keep note
            </button>
            <button
              className="button danger"
              onClick={() => {
                if (
                  update((s) => ({
                    ...s,
                    notes: s.notes.filter((n) => n.id !== deleting.id),
                  }))
                ) {
                  setDeleting(null);
                  setNotice("Note deleted.");
                }
              }}
            >
              Delete note
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
