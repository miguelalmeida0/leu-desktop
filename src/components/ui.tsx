import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import type { Document, Source } from "../domain/model";
import { useStore } from "../domain/store";

export function Cover({
  document,
  small = false,
}: {
  document: Document;
  small?: boolean;
}) {
  return (
    <div
      className={`book-cover ${document.cover} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      <span className="cover-series">LEU / ORIGINAL NOTES</span>
      <span className="cover-title">{document.title}</span>
      <span className="cover-rule" />
      <span className="cover-footer">READ · LEARN · GROW</span>
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="progress-group">
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${value}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}
export function SourceLink({
  source,
  label = "View exact source",
}: {
  source: Source;
  label?: string;
}) {
  const { allDocuments } = useStore();
  const doc = allDocuments.find((d) => d.id === source.documentId);
  return doc ? (
    <Link
      className="source-link"
      to={`/reader/${doc.id}?page=${source.page}&source=1`}
    >
      <span>
        {label}
        <small>
          {doc.title} · Page {source.page + 1}
        </small>
      </span>
      <ArrowUpRight size={16} />
    </Link>
  ) : null;
}
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1 tabIndex={-1}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </header>
  );
}
export function SectionHeading({ title, to }: { title: string; to?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          See all <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => {
      before?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title">
      <header>
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
