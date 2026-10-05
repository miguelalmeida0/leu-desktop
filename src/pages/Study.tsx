import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CircleHelp,
  AudioLines,
  MessagesSquare,
  AlignLeft,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../domain/store";
import { Cover, PageHeading, Progress, SectionHeading } from "../components/ui";
import { progressPercent } from "../domain/model";
import LearningSession from "../components/LearningSession";
const modes = [
  ["explain", "Explain", "Get clear, simple explanations.", BookOpen],
  ["quiz", "Quiz", "Test your knowledge.", CircleHelp],
  ["teach", "Teach", "Practice explaining in your own words.", AudioLines],
  ["discuss", "Discuss", "Explore different perspectives.", MessagesSquare],
  ["summarise", "Summarise", "Key ideas in seconds.", AlignLeft],
  ["apply", "Apply", "Turn insights into action.", Wrench],
] as const;
export default function Study() {
  const { state, allDocuments } = useStore();
  const [params, setParams] = useSearchParams();
  const doc =
    allDocuments.find((d) => d.id === params.get("doc")) ??
    allDocuments.find((d) => d.id === state.recent[0]) ??
    allDocuments[0];
  const raw = Number(params.get("page") ?? state.progress[doc.id] ?? 0);
  const page = Math.max(
    0,
    Math.min(doc.pages.length - 1, Number.isFinite(raw) ? Math.floor(raw) : 0),
  );
  const mode = params.get("mode");
  return (
    <div className="page">
      <PageHeading
        title="Learning Lab"
        subtitle="Turn what you read into understanding."
      >
        <select
          aria-label="Learning document"
          className="document-select"
          value={doc.id}
          onChange={(e) => setParams({ doc: e.target.value, page: "0" })}
        >
          {allDocuments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </PageHeading>
      {mode ? (
        <LearningSession
          key={`${doc.id}:${page}:${mode}`}
          doc={doc}
          page={page}
          mode={mode}
        />
      ) : (
        <>
          <div className="learning-grid">
            {modes.map(([id, title, description, Icon], i) => (
              <Link
                className="learning-card"
                key={id}
                to={`/study?doc=${doc.id}&page=${page}&mode=${id}`}
              >
                <span className={`learning-icon tone-${i}`}>
                  <Icon size={24} />
                </span>
                <h2>{title}</h2>
                <p>{description}</p>
                <span className="round-arrow">
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
          <section className="study-progress">
            <SectionHeading title="Your learning progress" to="/notes" />
            <div className="progress-strip">
              <Cover document={doc} small />
              <div className="progress-doc">
                <h3>{doc.title}</h3>
                <p>PDF · {doc.pages.length} pages</p>
                <Progress value={progressPercent(state, doc)} />
              </div>
              <div className="mini-stat">
                <strong>
                  {state.notes.filter((n) => n.documentId === doc.id).length}
                </strong>
                <span>Insights</span>
              </div>
              <div className="mini-stat">
                <strong>
                  {
                    state.attempts.filter(
                      (a) => a.documentId === doc.id && a.mode === "quiz",
                    ).length
                  }
                </strong>
                <span>Quizzes</span>
              </div>
              <div className="mini-stat">
                <strong>
                  {
                    state.attempts.filter(
                      (a) => a.documentId === doc.id && a.mode === "teach",
                    ).length
                  }
                </strong>
                <span>Teach-backs</span>
              </div>
              <Link
                className="button primary"
                to={`/reader/${doc.id}?page=${page}`}
              >
                Continue learning <ArrowRight size={16} />
              </Link>
            </div>
          </section>
          {state.attempts.length > 0 && (
            <p className="activity-proof">
              {state.attempts.length} learning{" "}
              {state.attempts.length === 1 ? "interaction" : "interactions"}{" "}
              completed in this browser. Your latest work is saved.
            </p>
          )}
        </>
      )}
    </div>
  );
}
