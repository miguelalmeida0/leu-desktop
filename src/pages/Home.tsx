import { Link } from "react-router-dom";
import {
  FileText,
  Lightbulb,
  GraduationCap,
  Network,
  Quote,
} from "lucide-react";
import { useStore } from "../domain/store";
import { progressPercent } from "../domain/model";
import {
  Cover,
  PageHeading,
  Progress,
  SectionHeading,
  SourceLink,
} from "../components/ui";
import ImportButton from "../components/ImportButton";
export default function Home() {
  const { state, allDocuments } = useStore();
  const metrics = [
    [allDocuments.length, "Documents", "In your library", FileText],
    [state.notes.length, "Insights", "Saved", Lightbulb],
    [
      state.attempts.filter((a) => a.mode === "quiz").length,
      "Quizzes",
      "Completed",
      GraduationCap,
    ],
    [state.trails.length, "Trails", "Created", Network],
  ] as const;
  const recent = state.recent
    .map((id) => allDocuments.find((d) => d.id === id))
    .filter((d) => !!d)
    .slice(0, 3);
  return (
    <div className="page home-page">
      <PageHeading
        title="Good to see you."
        subtitle="A calm mind builds a brighter you."
      >
        <ImportButton />
      </PageHeading>
      <div className="metrics">
        {metrics.map(([value, title, sub, Icon], i) => (
          <div className="metric" key={title}>
            <span className={`metric-icon tone-${i}`}>
              <Icon size={24} />
            </span>
            <div>
              <strong>{value}</strong>
              <p>
                {title}
                <br />
                <span>{sub}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="home-columns">
        <section>
          <SectionHeading title="Continue where you left off" to="/library" />
          <div className="reading-list">
            {recent.map((doc) => (
              <Link
                className="reading-row"
                key={doc.id}
                to={`/reader/${doc.id}`}
              >
                <Cover document={doc} small />
                <div>
                  <h3>{doc.title}</h3>
                  <p>
                    PDF · Page {(state.progress[doc.id] ?? 0) + 1} of{" "}
                    {doc.pages.length}
                  </p>
                  <Progress value={progressPercent(state, doc)} />
                </div>
                <span className="row-action">Continue</span>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <SectionHeading title="Recent insights" to="/notes" />
          <div className="insight-list">
            {state.notes
              .slice(-3)
              .reverse()
              .map((note) => (
                <article className="insight" key={note.id}>
                  <Quote size={20} />
                  <div>
                    <p>“{note.text}”</p>
                    <SourceLink source={note} label="Return to source" />
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
