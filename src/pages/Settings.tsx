import { useState } from "react";
import { Modal, PageHeading } from "../components/ui";
import { useStore } from "../domain/store";
export default function Settings() {
  const { reset } = useStore();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="page">
      <PageHeading
        title="Settings"
        subtitle="A little clarity about your workspace."
      />
      <div className="settings-sections">
        <section>
          <h2>About Leu Desktop</h2>
          <span className="demo-pill">Deterministic demo</span>
          <p>
            A browser companion to Leu’s reading and learning experience. The
            six sample PDFs contain original notes. Explanations, questions and
            concept connections are prepared from those sources.
          </p>
          <p>
            This demo does not run Apple Foundation Models or make live model
            requests. Teach Leu uses a simple source-term checklist, not
            semantic grading. Sample notes and one trail are seeded so you can
            explore immediately; quiz and teach-back counts begin at zero.
          </p>
        </section>
        <section>
          <h2>Your data stays in this browser</h2>
          <p>
            Notes, progress, trails and imported text are saved locally. No
            account, telemetry, analytics, API key or backend is required. PDFs
            are parsed on your device and never uploaded. Imported PDF text can
            be read here; the original file stays on your device.
          </p>
          <p>
            Browser storage is not a backup. Clearing site data removes your
            changes. On a shared device, reset the demo when you finish.
          </p>
        </section>
        <section>
          <h2>Make yourself at home</h2>
          <p>
            Use Tab to move between controls, Enter to activate, and the
            left/right arrow keys on the reading canvas to turn pages. Press ⌘K
            or Ctrl+K to search the library. Motion follows your system’s
            reduced-motion preference.
          </p>
        </section>
        <section className="reset-section">
          <div>
            <h2>A fresh start</h2>
            <p>
              Restore the original sample state and remove your local demo
              interactions and imports.
            </p>
          </div>
          <button className="button" onClick={() => setOpen(true)}>
            Reset demo
          </button>
        </section>
      </div>
      <p role="status">{notice}</p>
      {open && (
        <Modal title="Reset your demo?" onClose={() => setOpen(false)}>
          <p>
            This removes the notes, imported text, progress, quiz results and
            trails you added in this browser. The six original samples and
            seeded notes will be restored.
          </p>
          <div className="dialog-actions">
            <button className="button" onClick={() => setOpen(false)}>
              Keep my work
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (reset()) {
                  setOpen(false);
                  setNotice(
                    "Demo reset. The original sample library is ready.",
                  );
                }
              }}
            >
              Restore sample state
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
