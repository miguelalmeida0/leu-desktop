import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useStore } from "../domain/store";
import type { Document } from "../domain/model";
import { learningFor, compareExplanation } from "../domain/intelligence";
import { SourceLink } from "./ui";

export default function LearningSession({
  doc,
  page,
  mode,
}: {
  doc: Document;
  page: number;
  mode: string;
}) {
  const { state, update } = useStore();
  const key = `${doc.id}:${page}:${mode}`;
  const [answer, setAnswer] = useState(state.drafts[key] ?? "");
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const learning = learningFor(doc, page);
  const compared = compareExplanation(answer, learning.terms);
  const source = { documentId: doc.id, page };
  const titles: Record<string, string> = {
    explain: "Explain like I’m 10",
    quiz: "Ask Me",
    teach: "Teach Leu",
    discuss: "Discuss & connect",
    summarise: "The essential idea",
    apply: "Try it in your own work",
  };
  function saveAnswer(value: string) {
    setAnswer(value);
    setSubmitted(false);
    update((s) => ({ ...s, drafts: { ...s.drafts, [key]: value } }));
  }
  function submit() {
    const correct =
      mode === "quiz"
        ? choice === learning.correct
        : compared.missing.length === 0;
    if (
      update((s) => ({
        ...s,
        attempts: [
          ...s.attempts,
          {
            id: crypto.randomUUID(),
            ...source,
            mode: mode === "quiz" ? "quiz" : "teach",
            answer: mode === "quiz" ? learning.options[choice!] : answer,
            correct,
          },
        ],
      }))
    )
      setSubmitted(true);
  }
  return (
    <div className="learning-session">
      <div className="session-main">
        <Link className="text-link" to={`/study?doc=${doc.id}&page=${page}`}>
          <ArrowLeft size={16} />
          Learning Lab
        </Link>
        <h2>{titles[mode] ?? titles.explain}</h2>
        <p className="muted">
          {doc.title} · Page {page + 1} · {doc.pages[page].heading}
        </p>
        {mode === "teach" ? (
          <>
            <p>
              Explain the idea in your own words. Then bring the source back
              into view.
            </p>
            <label htmlFor="explanation">Your explanation</label>
            <textarea
              id="explanation"
              rows={7}
              maxLength={4000}
              value={answer}
              onChange={(e) => saveAnswer(e.target.value)}
              placeholder="I understand this as…"
            />
            <div className="form-footer">
              <span>{answer.length} / 4000 · Local draft</span>
              <button
                className="button primary"
                disabled={answer.trim().length < 12 || submitted}
                onClick={submit}
              >
                Compare with source <ArrowUpRight size={16} />
              </button>
            </div>
            {submitted && (
              <div className="result" role="status">
                <h3>Compare your explanation</h3>
                <p>
                  Your explanation mentions {compared.covered.length} of{" "}
                  {learning.terms.length} source terms.
                </p>
                <p>
                  <strong>Revisit:</strong>{" "}
                  {compared.missing.length
                    ? compared.missing.join(", ")
                    : "All checklist terms appear in your explanation."}
                </p>
                <p className="fine-print">
                  This is a deterministic word checklist, not a judgement of
                  understanding. A term can appear in an incorrect explanation.
                  Compare the meaning yourself.
                </p>
                <blockquote>{learning.quote}</blockquote>
                <SourceLink source={source} />
              </div>
            )}
          </>
        ) : mode === "quiz" ? (
          <>
            <h3>{learning.question}</h3>
            <fieldset className="quiz-options">
              <legend className="sr-only">Choose a supported statement</legend>
              {learning.options.map((option, i) => (
                <label
                  key={i}
                  className={
                    choice === i ? "quiz-option chosen" : "quiz-option"
                  }
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={choice === i}
                    disabled={submitted}
                    onChange={() => setChoice(i)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <button
              className="button primary"
              disabled={choice === null || submitted}
              onClick={submit}
            >
              Check answer
            </button>
            {submitted && (
              <div className="result" role="status">
                <h3>
                  {choice === learning.correct
                    ? "Supported by the source"
                    : "Let’s return to the source"}
                </h3>
                <p>{learning.quote}</p>
                <SourceLink source={source} />
                <button
                  className="button"
                  onClick={() => {
                    setSubmitted(false);
                    setChoice(null);
                  }}
                >
                  Try again
                </button>
              </div>
            )}
          </>
        ) : mode === "apply" ? (
          <>
            <p>
              Choose a small example from your own work. How would the idea on
              this page change one decision?
            </p>
            <blockquote>{learning.quote}</blockquote>
            <label htmlFor="application">Your next step</label>
            <textarea
              id="application"
              rows={6}
              value={answer}
              onChange={(e) => saveAnswer(e.target.value)}
              maxLength={4000}
            />
            <button
              className="button primary"
              disabled={!answer.trim() || submitted}
              onClick={() => {
                if (
                  update((s) => ({
                    ...s,
                    notes: [
                      ...s.notes,
                      {
                        id: crypto.randomUUID(),
                        ...source,
                        text: answer,
                        created: Date.now(),
                      },
                    ],
                  }))
                )
                  setSubmitted(true);
              }}
            >
              Save as an insight
            </button>
            {submitted && <p role="status">Insight saved to Notes.</p>}
          </>
        ) : mode === "discuss" ? (
          <>
            <p>
              How does this idea connect to responsibilities, identity, and the
              choices we make in a system?
            </p>
            <blockquote>{learning.quote}</blockquote>
            <p>
              Follow a concept to compare related passages. Connections are
              curated from the original sample notes.
            </p>
            <Link className="button primary" to="/trails">
              Explore connections <ArrowUpRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <div className="explanation-copy">
              <p>
                {mode === "summarise" ? learning.quote : learning.explanation}
              </p>
            </div>
            <p className="fine-print">
              {mode === "summarise"
                ? "An exact source excerpt."
                : "A prepared, source-backed explanation."}
            </p>
            <Link
              className="button primary"
              to={`/study?doc=${doc.id}&page=${page}&mode=teach`}
            >
              Now teach it back <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </div>
      <aside className="session-source">
        <span className="small-label">YOUR SOURCE</span>
        <h3>{doc.pages[page].heading}</h3>
        <blockquote>{learning.quote}</blockquote>
        <SourceLink source={source} />
        <div className="source-foot">
          <Check size={16} />
          Grounded in your document
        </div>
      </aside>
    </div>
  );
}
