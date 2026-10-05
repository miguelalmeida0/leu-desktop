# Workspace boundaries

The source corpus is immutable. Learner state is a separately validated object in origin-local browser storage. Page components compose the shared shell and reusable controls; learning rules are pure functions in the domain layer. Navigation and in-memory search are not persisted learner data. Document source identity is carried explicitly through every learning interaction.

Reader progression and paper presentation belong to Reader. Contextual questions, notes and provenance belong to ReaderTools. PDF.js and its worker are loaded only after file selection. Imports extract text, never embedded scripts or navigation, and are bounded by byte, page, text and time limits.

Most components are below 250 formatted lines. Two close exceptions are intentional: LearningSession keeps the six related mode branches and their result state together (259 lines), while Trails owns coordinated graph selection, viewport controls and trail/source selection (282 lines). Neither owns corpus generation, persistence validation or intelligence rules.

The recruiter home reflects actual seeded/current local counts. Initial quizzes and teach-backs are zero. All learning output is deterministic, explicitly described in Settings; word overlap is not semantic grading. Local data has no server backup or cross-device sync.

Vercel serves a static SPA. Production preview uses the same header configuration for browser verification. No application backend, authentication integration, model provider or telemetry is deployed.
