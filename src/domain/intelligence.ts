import type { Document } from "./model";

const explanations: Record<string, string[]> = {
  react: [
    "Think of rendering as drawing a plan and committing as building it. React first works out what the interface should look like from props, state and context. It then applies the needed changes. Keep side effects out of the planning step.",
    "A render is like a photograph of your state. Asking for an update schedules a new photograph; it cannot change the one your event handler is already holding. A functional updater receives the previous pending value when updates are queued.",
    "A key is a name tag for an item among its siblings. A stable name tag lets React recognise that item after the list moves. Position numbers or fresh random tags can connect the wrong state or lose continuity.",
    "These short notes are a starting point. Return to an exact page to check an explanation. Your own notes and highlights stay separate from the source.",
  ],
  system: [
    "Start by asking who needs the system and what must work. Choose the architecture for those needs. A personal reader can need reliable local files more than a complex global service.",
    "Give each part one clear job: the view shows state, a service coordinates work, and storage saves it. Pass the information a screen needs instead of making every screen understand the database.",
    "A cache is a spare copy that saves repeated work. It can become stale. Decide which copy is the original and what can be rebuilt. A thumbnail can be recreated; someone’s annotations cannot.",
    "A preview is not a completed save. Consider interruptions, full storage and broken input, and say clearly when work was not saved.",
  ],
  javascript: [
    "Pick an array method by the result you need: find gives one item, filter gives an array, and some or every gives a boolean. The next step must accept that shape.",
    "An arrow expression returns its result. When you add braces, you need return. Otherwise map collects undefined for each callback.",
    "A closure is a function that keeps access to the environment where it was created. Separate calls to counter create separate environments.",
    "Make a new array and a new object for the changed item. The unchanged objects can be shared. This only copies the outer level.",
  ],
  patterns: [
    "A useful pattern makes a responsibility clear. A storage interface lets a workflow use either disk storage or a test double.",
    "Keep rendering, decisions and storage apart so a typography change does not change saving files. A short file is useful only if its responsibility is clear.",
    "Depend on a storage contract, then supply the concrete implementation at composition time. A test can deliberately make saving fail without corrupting real data.",
    "Add a boundary when it protects something that matters. Every extra abstraction is another idea someone must learn.",
  ],
  cs: [
    "A model leaves out details that do not affect your decision. Last-in, first-out tells you what a stack removes without deciding how it is stored.",
    "Complexity describes how work grows, not exact seconds. Binary search needs ordered data; include preparation costs when reasoning about a solution.",
    "Two names can point to one object. Changing that object affects both. Copying an outer object does not automatically copy nested objects.",
    "Choose a data structure for its operations and guarantees. Original files and searchable metadata can use different representations.",
  ],
  interviews: [
    "Agree on inputs, outputs and edge cases before coding. A tiny example makes hidden assumptions easier to spot.",
    "Follow execution step by step and record both value and type. Filter gives an array that map can transform, including when no elements match.",
    "Test the assumptions: empty inputs, repeated values and unusual ordering. A caller needs to handle an undefined result.",
    "Explain your assumptions and tradeoffs. A speed claim needs an input, runtime and measurement; simpler code is a good starting point.",
  ],
};
export function learningFor(document: Document, page: number) {
  const source = document.pages[page];
  const quote = source.text.split("\n\n")[0].replace(/\s+/g, " ").trim();
  const words = quote.toLowerCase().match(/[a-z]{5,}/g) ?? [];
  const terms = [...new Set(words)]
    .filter(
      (word) =>
        ![
          "which",
          "their",
          "there",
          "these",
          "those",
          "before",
          "after",
          "about",
          "should",
          "while",
        ].includes(word),
    )
    .slice(0, 5);
  return {
    quote,
    terms,
    explanation:
      explanations[document.id]?.[page] ??
      `Read this source statement carefully: “${quote}” Restate it in your own words, then compare with the original.`,
    question: `Which statement is supported by “${source.heading}”?`,
    options: [
      "The source says that implementation details never affect the outcome.",
      quote,
      "The source recommends skipping boundary and failure cases.",
    ],
    correct: 1,
  };
}
export function compareExplanation(answer: string, terms: string[]) {
  const text = answer.toLowerCase();
  return {
    covered: terms.filter((term) => text.includes(term)),
    missing: terms.filter((term) => !text.includes(term)),
  };
}
export const concepts = [
  {
    id: "Thinking",
    x: 350,
    y: 280,
    sources: [
      { documentId: "cs", page: 0 },
      { documentId: "interviews", page: 0 },
    ],
  },
  {
    id: "State",
    x: 350,
    y: 100,
    sources: [
      { documentId: "react", page: 1 },
      { documentId: "javascript", page: 3 },
    ],
  },
  {
    id: "Identity",
    x: 155,
    y: 255,
    sources: [
      { documentId: "react", page: 2 },
      { documentId: "cs", page: 2 },
    ],
  },
  {
    id: "Boundaries",
    x: 555,
    y: 255,
    sources: [
      { documentId: "patterns", page: 1 },
      { documentId: "system", page: 1 },
    ],
  },
  {
    id: "Tradeoffs",
    x: 450,
    y: 450,
    sources: [
      { documentId: "system", page: 2 },
      { documentId: "interviews", page: 3 },
    ],
  },
  {
    id: "Reasoning",
    x: 215,
    y: 450,
    sources: [
      { documentId: "cs", page: 1 },
      { documentId: "interviews", page: 1 },
    ],
  },
];
