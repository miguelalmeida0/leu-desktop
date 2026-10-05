import { z } from "zod";
import corpus from "./corpus.json";

export const pageSchema = z.object({
  heading: z.string().max(300),
  text: z.string().max(30000),
});
export const documentSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(200),
  category: z.string().max(50),
  cover: z.string().max(20),
  pages: z.array(pageSchema).min(1).max(40),
  kind: z.literal("PDF"),
  file: z.string().startsWith("/samples/").optional(),
});
export type Document = z.infer<typeof documentSchema>;
export type Source = { documentId: string; page: number };
const sourceFields = {
  documentId: z.string().max(100),
  page: z.number().int().min(0).max(39),
};
export const noteSchema = z.object({
  id: z.string(),
  text: z.string().max(4000),
  ...sourceFields,
  created: z.number(),
});
export type Note = z.infer<typeof noteSchema>;
export const stateSchema = z
  .object({
    version: z.literal(1),
    imported: z.array(documentSchema).max(20),
    progress: z.record(z.string(), z.number().int().min(0).max(39)),
    recent: z.array(z.string()).max(30),
    notes: z.array(noteSchema).max(200),
    highlights: z.array(z.object(sourceFields)).max(200),
    attempts: z
      .array(
        z.object({
          id: z.string(),
          ...sourceFields,
          mode: z.enum(["teach", "quiz"]),
          answer: z.string().max(4000),
          correct: z.boolean(),
        }),
      )
      .max(200),
    drafts: z.record(z.string(), z.string().max(4000)),
    trails: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().min(1).max(80),
          concept: z.string().max(80),
          sources: z.array(z.object(sourceFields)).max(20),
        }),
      )
      .max(100),
  })
  .superRefine((state, ctx) => {
    const byId = new Map(
      [...documents, ...state.imported].map((document) => [
        document.id,
        document,
      ]),
    );
    const sources = [
      ...state.notes,
      ...state.highlights,
      ...state.attempts,
      ...state.trails.flatMap((trail) => trail.sources),
    ];
    for (const source of sources) {
      if (!byId.get(source.documentId)?.pages[source.page]) {
        ctx.addIssue({
          code: "custom",
          message: "Saved source is missing or out of bounds.",
        });
        break;
      }
    }
    for (const [id, page] of Object.entries(state.progress)) {
      if (!byId.get(id)?.pages[page]) {
        ctx.addIssue({
          code: "custom",
          message: "Saved progress is out of bounds.",
        });
        break;
      }
    }
  });
export type LearnerState = z.infer<typeof stateSchema>;
export const documents: Document[] = z.array(documentSchema).parse(corpus);
export const STORAGE_KEY = "leu-desktop:v1";
export const initialState = (): LearnerState => ({
  version: 1,
  imported: [],
  progress: { react: 1, system: 0, javascript: 0 },
  recent: ["react", "system", "javascript"],
  notes: [
    {
      id: "seed-1",
      documentId: "react",
      page: 1,
      text: "Setting state requests another render. The current handler still sees its snapshot.",
      created: 1,
    },
    {
      id: "seed-2",
      documentId: "system",
      page: 2,
      text: "Original documents are not disposable caches. Derived thumbnails can be recreated.",
      created: 2,
    },
    {
      id: "seed-3",
      documentId: "patterns",
      page: 1,
      text: "Keep rendering, workflow decisions and durable storage separate.",
      created: 3,
    },
  ],
  highlights: [],
  attempts: [],
  drafts: {},
  trails: [
    {
      id: "seed-trail",
      title: "Identity & state",
      concept: "Identity",
      sources: [
        { documentId: "react", page: 2 },
        { documentId: "cs", page: 2 },
      ],
    },
  ],
});
export function progressPercent(state: LearnerState, document: Document) {
  return state.progress[document.id] === undefined
    ? 0
    : Math.round(
        ((state.progress[document.id] + 1) / document.pages.length) * 100,
      );
}
